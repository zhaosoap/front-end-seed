import sys
import os
import time
import itertools
import numpy as np
import math
import pandas as pd
import theano
import theano.tensor as T
from keras.models import Graph,Sequential
from keras.layers.core import Dense, Dropout, Activation, Merge, Reshape, Flatten
from keras.layers.embeddings import Embedding
from keras.optimizers import SGD, Adagrad, Adadelta
from utils import preprocess, make_vocab, compute_error, zip_name, to_string
import cPickle as pickle
from sacred import Experiment
from sacred.observers import MongoObserver
import pymongo
from ...utils import distance
import json
rc = 6378137
rj = 6356725

ex_alg_MLP_aus = Experiment('ALG_MLP_aus_expt')

def build_mlp(n_con, n_dis, dis_dims, vocab_sizes, n_grid, emb_size, hidden_num, hidden_size):
    assert(n_dis == len(dis_dims) == len(vocab_sizes))
    seq_list=[Sequential() for i in range(n_dis)]
    # Define a graph
    network = Sequential()
    # Input Layer
    input_layers = []
    num_input=Sequential()
    num_input.add(Reshape((n_con,),input_shape=(n_con,)))
    input_layers.append(num_input)
    ## embedding inputs
    for i in range(n_dis):
        seq_list[i].add(Embedding(vocab_sizes[i],emb_size,input_length=dis_dims[i]))
        seq_list[i].add(Flatten())
        input_layers.append(seq_list[i])
    network.add(Merge(input_layers,mode='concat'))
    for i in range(hidden_num):
        network.add(Dense(hidden_size,activation='tanh'))
#network.add(Dropout(0.3))
    # Ouput Layer
    network.add(Dense(n_grid,activation='softmax'))
    return network

def permutate_to_augment(df):
    for i in range(len(df)):
        record = df.iloc[i]
        valid_idx = []
        for nei_id in range(1, 7):
            a = record.loc['All-Neighbor LAC (Sorted)[%d]'%nei_id]
            if not math.isnan(a):
                valid_idx.append(nei_id)

def load_dataset(f_name, eng_para, augment=False):
    df = pd.read_csv(f_name)
    # Remove some records with missing values
    df = df[df['All-LAC'].notnull() & df['All-Cell Id'].notnull() & df['All-Longitude'].notnull() & df['All-Latitude'].notnull() & (df['Message Type'] == 'Measurement Report')]

    # Augment dataset by permutate the order of lac_ci
#    if augment:
#        df = permutate_to_augment(df)

    # Join with Engineer Parameter data
    df = df.merge(eng_para, left_on=['All-LAC', 'All-Cell Id'], right_on=['LAC', 'CI'], how='left')
    t_base = df.loc[:,['Longitude','Latitude']].values
    t_time = df.loc[:,['Time']].values
    eng_para_ = eng_para.loc[:, ['LAC', 'CI', 'Longitude', 'Latitude']] # For all the neighbor, just join the longitude and latitude of BTSs
    for i in range(1, 7):
        df = df.merge(eng_para_, left_on=['All-Neighbor LAC (Sorted)[%d]' % i, 'All-Neighbor Cell Id (Sorted)[%d]' % i], right_on=['LAC','CI'], how='left', suffixes=('', '_%d' % i))
        df = df.drop(['LAC_%d' % i, 'CI_%d' % i], axis=1)

    # Fill default number to NULL entries (-999 means very week)
    df = df.fillna(-999)

    # Select LABEL data (longitude and latitude)
    label = df.loc[:, ['All-Longitude', 'All-Latitude']].values
    # Select BTS location data to mesure distance between UE and BTS
    bts = df.loc[:, ['Longitude', 'Latitude']].values

    # Deal with id features separately
    # !!!(Here manipulate discrete feature separately, later can write a common version to deal with all the discrete feature by pass discrete feature names)
    # LAC, CI (Location Area Code, Cell Id)
    lacci_vals = [map(lambda x: '%.0f,%.0f' % (x[0], x[1]), df.loc[:, ['All-LAC', 'All-Cell Id']].values)]
    for nei_id in range(1, 7):
        lacci_vals.append(map(lambda x: '%.0f,%.0f' % (x[0], x[1]),
                    df.loc[:, ['All-Neighbor LAC (Sorted)[%d]'%nei_id, 'All-Neighbor Cell Id (Sorted)[%d]'%nei_id]].values))
        df = df.drop(['All-Neighbor LAC (Sorted)[%d]'%nei_id, 'All-Neighbor Cell Id (Sorted)[%d]'%nei_id], axis=1)
    # BSIC (Base Station Identity Code), value range 0-63
    bsic_vals = [map(lambda x: '%.0f' % x, df.loc[:, 'All-BSIC (Num)'].values)]
    for nei_id in range(1, 7):
        bsic_vals.append(map(lambda x: '%.0f' % x, df.loc[:, 'All-Neighbor BSIC (Num) (Sorted)[%d]'%nei_id]))
        df = df.drop('All-Neighbor BSIC (Num) (Sorted)[%d]'%nei_id, axis=1)
    # ARFCN BCCH (Absolute Radio Frequency Channel Number, Broadcast Control Channel)
    arfcn_vals = [map(lambda x: '%.0f' % x, df.loc[:, 'All-ARFCN BCCH'].values)]
    for nei_id in range(1, 7):
        arfcn_vals.append(map(lambda x: '%.0f' % x, df.loc[:, 'All-Neighbor ARFCN (Sorted)[%d]'%nei_id]))
        df = df.drop('All-Neighbor ARFCN (Sorted)[%d]'%nei_id, axis=1)

    # Drop irrelevant columns
    df = df.drop(['All-Longitude', 'All-Latitude', 'Time', 'MS', 'Frame Number', 'Direction', 'Message Type', 'Event', 'EventInfo', 'All-LAC', 'All-Cell Id', 'LAC', 'CI', 'All-BSIC (Num)', 'All-ARFCN BCCH'], axis=1)

    # Compute distance between UE and BTS
    #dist = []
    #for bts_pt, true_pt in zip(bts, label):
    #    if bts_pt[0] > 0:
    #        dist.append(compute_error(bts_pt, true_pt))
    #print 'Mean Distance\t%f' % np.mean(dist)
    #print 'Median Distance\t%f' % np.median(dist)
    #print 'Max Distance\t%f' % np.max(dist)

    return df.values, label, [lacci_vals, bsic_vals, arfcn_vals], t_time, t_base

def run(trainPath, testPath, config,outPath):
    eng_para = pd.read_csv('data/2g_gongcan_old.csv')
    tr_feature, tr_label, tr_ids, tr_time, tr_base = load_dataset(trainPath, eng_para, True)
    tr_label=pickle.load(open('data/tr_label.pkl'))
    te_feature, te_label, te_ids, te_time, te_base = load_dataset(testPath, eng_para, False)
    train_size, n_con = tr_feature.shape
    test_size, n_con = te_feature.shape
    n_dis = len(tr_ids)
        # Create neural network model
    print 'Preprocessing data ...'
    # Standardize continous input
    tr_feature, te_feature = preprocess(tr_feature, te_feature)
    tr_input = []
    tr_input.append(tr_feature)
    te_input = []
    te_input.append(te_feature)
    # Prepare embedding input
    dis_dims, vocab_sizes = [], []
    for ii, tr_ids_, te_ids_ in zip(range(n_dis), tr_ids, te_ids): # make sure tr_ids contain several different discrete features
        vocab_size, vocab_dict = make_vocab(tr_ids_, te_ids_)
        tr_id_idx_, te_id_idx_ = [], []
        dis_dim = len(tr_ids_)
        for i in range(dis_dim):
            tr_id_idx_ += map(lambda x: vocab_dict[x], tr_ids_[i])
            te_id_idx_ += map(lambda x: vocab_dict[x], te_ids_[i])
        tr_ids = np.array(tr_id_idx_, dtype=np.int32).reshape(dis_dim, train_size).transpose()
        te_ids = np.array(te_id_idx_, dtype=np.int32).reshape(dis_dim, test_size).transpose()
        tr_ids = np.array([sorted(i) for i in tr_ids])
        te_ids = np.array([sorted(i) for i in te_ids])
        ## Add discrete feature to dict
        tr_input.append(tr_ids)
        te_input.append(te_ids)

        dis_dims.append(dis_dim)
        vocab_sizes.append(vocab_size)
    print 'Building model and compiling functions ...'
    # Define network structure
    grid_info = np.asarray(pickle.load(open('data/grid_center.pkl')))
    #emb_size, hidden_num, hidden_size
    network = build_mlp(n_con, n_dis, dis_dims, vocab_sizes, len(grid_info),config['layer1']['emb_size'],config['layer1']['hidden_num'],config['layer1']['hidden_size'])
    #'categorical_crossentropy'
    network.compile(loss=config['layer1']['loss'], optimizer=Adagrad())
    network.fit(tr_input,tr_label,nb_epoch=config['layer1']['nb_epoch'], batch_size=config['layer1']['batch_size'], verbose=0)
    tr_pred = np.asarray(network.predict(tr_input))
    tr_pred = np.argmax(tr_pred, axis=1)
    tr_pred = [grid_info[idx] for idx in tr_pred]

    te_pred = np.asarray(network.predict(te_input))
    te_pred = np.argmax(te_pred, axis=1)
    te_pred = [grid_info[idx] for idx in te_pred]
    tr_feature = np.concatenate((tr_feature,tr_pred), axis=1)
    te_feature = np.concatenate((te_feature,te_pred), axis=1)
    tr_input[0] = tr_feature
    te_input[0] = te_feature
    print 'second layer'
    network1 = build_mlp(n_con+2, n_dis, dis_dims, vocab_sizes, len(grid_info),config['layer2']['emb_size'],config['layer2']['hidden_num'],config['layer2']['hidden_size'])
    network1.compile(loss=config['layer2']['loss'], optimizer=Adagrad())
    network1.fit(tr_input,tr_label,nb_epoch=config['layer2']['nb_epoch'], batch_size=config['layer2']['batch_size'], verbose=0)
    te_pred1 = np.asarray(network1.predict(te_input))
    te_pred1 = np.argmax(te_pred1, axis=1)
    te_pred1 = np.array([grid_info[idx] for idx in te_pred1])
    error = [distance(pt1, pt2) for pt1, pt2 in zip(te_pred1, te_label)]
    error = sorted(error)
    # dump error
    f_err = outPath + 'tot_error'
    with open(f_err, 'wb') as f:
        pickle.dump(error, f)
    te_base = np.array(te_base)
    te_time = np.array(te_time)
    outDF = pd.DataFrame()
    outDF['time'] = te_time[:,0]
    outDF['predict-Long'] = te_pred1[:,0]
    outDF['predict-Lat'] = te_pred1[:,1]
    outDF['real-Long'] = te_label[:,0]
    outDF['real-Lat'] = te_label[:,1]
    outDF['ServingBase-Long'] = te_base[:,0]
    outDF['ServingBase-Lat'] = te_base[:,1]
    outDF.to_csv(outPath + 'outDF.csv')

    # save result
    result ={
        'outPath':outPath,
        'TestSize':len(error),
        'MaxError':np.max(error),
        'MinError':np.min(error),
        'MeanError':np.mean(error),
        'MedianError':np.median(error),
        'Per67Error':error[int(len(error) * 0.67)],
        'Per80Error':error[int(len(error) * 0.8)],
        'Per90Error':error[int(len(error) * 0.9)]
    }
    return result

@ex_alg_MLP_aus.main
def start(criteria):
    id = criteria["id"]
    configuration = criteria["configuration"]
    trainSet = criteria["trainSet"]
    testSet = criteria["testSet"]
    trainPath = 'data/train/' + trainSet
    testPath = 'data/test/'+ testSet
    files = os.listdir('data/results/'+id+'/')
    outPath = 'data/results/'+id+'/'+str(len(files))+'/'
    os.mkdir(outPath)

    res = run(trainPath,testPath,configuration,outPath)
    res['trainSet'] = trainSet
    res['testSet'] = testSet
    res['id'] = id
    res['algResNumber'] = str(len(files))
    res['cdf'] = 'results/'+id+'/'+str(len(files))+'/cdf.png'
    f_res = open(outPath + 'result.txt', 'w')
    f_res.write(json.dumps(res))
    return res
