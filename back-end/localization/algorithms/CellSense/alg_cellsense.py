# coding: utf-8
# python package
import numpy as np
import os
import json
import cPickle as pickle
import pandas as pd
# sacred
from sacred import Experiment
# from sacred.observers import MongoObserver
from ...utils import distance

ex_alg_cellsense = Experiment('ALG_CellSense_expt')

def encode_lacci(lac, ci):
    return int(lac)*100000+int(ci)

class FingerPrint:
    def __init__(self, id_list, strength_list, lnglat=None):
        assert(len(id_list) == len(strength_list))
        self.id_list = id_list
        self.strength_list = strength_list
        self.lnglat = lnglat

class Histogram:
    def __init__(self, data, default_std):
        self.mean = np.mean(data)
        self.std = np.std(data)
        if self.std == 0:
            self.std = default_std

    def get_proba(self, v):
        return np.exp(-(v-self.mean)**2/(self.std**2))/(np.sqrt(2*np.pi)*self.std)


class Grid:
    def __init__(self, ld, ru):
        self.ld = ld
        self.ru = ru
        self.stats = {}
        self.points = []

        self.lnglat = None
        self.hist = {}

    def in_grid(self, x, y):
        return self.ld[0] <= x < self.ru[0] and self.ld[1] <= y < self.ru[1]

    def compute_histogram(self, default_std):
        self.hist = {}
        for cid in self.stats.keys():
            self.hist[cid] = Histogram(self.stats[cid], default_std)
        self.lnglat = tuple(np.mean(self.points, axis=0))

    def add_fingerpoint(self, fp):
        for cid, strength in zip(fp.id_list, fp.strength_list):
            self.points.append(fp.lnglat)
            if not self.stats.has_key(cid):
                self.stats[cid] = []
            self.stats[cid].append(strength)

    def add_fingerpoints(self, fps):
        for fp in fps:
            self.add_fingerpoint(fp)

    def get_proba(self, fp):
        if len(self.hist) > 0:
            proba = 1.
            for cid, strength in zip(fp.id_list, fp.strength_list):
                if cid not in self.hist.keys():
                    proba *= 0.0001
                    continue
                h = self.hist[cid]
                proba *= h.get_proba(strength)
            return proba
        else:
            print 'Please call compute_histogram first'

    def get_probas(self, fps):
        return [self.get_proba(fp) for fp in fps]

class CellSense:
    def __init__(self, area, grid_length, default_std):
        self.ld, self.ru = area
        self.grid_length = grid_length
        self.default_std = default_std
        self.vsize = distance(self.ld, (self.ld[0], self.ru[1])) / grid_length
        self.hsize = distance(self.ld, (self.ru[0], self.ld[1])) / grid_length
        self.glng_offset = (self.ru[0]-self.ld[0]) / grid_length
        self.glat_offset = (self.ru[1]-self.ld[1]) / grid_length

        self.grid = {}

    def get_grid(self, lnglat):
        x, y = lnglat
        if self.ld[0] <= x < self.ru[0] and self.ld[1] <= y < self.ru[1]:
            i = int(distance(self.ld, (x, self.ld[1])) / self.grid_length)
            j = int(distance(self.ld, (self.ld[0], y)) / self.grid_length)

            gx = self.ld[0] + i*self.glng_offset
            gy = self.ld[1] + i*self.glat_offset
            return i * self.hsize + j, (gx, gy), (gx+self.glng_offset, gy+self.glat_offset)
        else: # not in this grid
            return -1, -1, -1

    def transform(self, df):
        data = []
        df = df.fillna(-999)
        for idx, row in df.iterrows():
            id_list = []
            st_list = []
            main_lac = row['All-LAC']
            main_ci = row['All-Cell Id']
            main_rxlev = row['All-RxLev Sub (dBm)']
            if int(main_lac) != -999 and int(main_ci) != -999 and int(main_rxlev) != -999:
                id_list.append(encode_lacci(main_lac, main_ci))
                st_list.append(main_rxlev)
            for i in range(1, 7):
                lac = row['All-Neighbor LAC (Sorted)[%d]'%(i)]
                ci = row['All-Neighbor Cell Id (Sorted)[%d]'%(i)]
                rxlev = row['All-Neighbor RxLev (dBm) (Sorted)[%d]'%(i)]
                try:
                    if int(lac) == -999 or int(ci) == -999 or int(rxlev) == -999:
                        continue
                    id_list.append(encode_lacci(lac, ci))
                    st_list.append(rxlev)
                except Exception, _data:
                    print _data, lac, ci, idx
                    exit()
            data.append(FingerPrint(id_list, st_list, (row['All-Longitude'], row['All-Latitude'])))
        return data

    def fit(self, data, transform_func=None):
        fps = transform_func(data) if transform_func is not None else self.transform(data)
        for fp in fps:
            gid, gld, gru = self.get_grid(fp.lnglat)
            if not self.grid.has_key(gid):
                self.grid[gid] = Grid(gld, gru)
            self.grid[gid].add_fingerpoint(fp)
        # compute histograms
        for gid in self.grid.keys():
            self.grid[gid].compute_histogram(self.default_std)

    def predict(self, data, transform_func=None):
        fps = transform_func(data) if transform_func is not None else self.transform(data)
        # scores = []
        # for gid in self.grid.keys():
            # g = self.grid[gid]
            # scores.append(g.get_probas(fps))
        scores = [self.grid[gid].get_probas(fps) for gid in self.grid.keys()]

        pred_gids = np.argmax(scores, axis=0)
        pred = [self.grid[self.grid.keys()[idx]].lnglat for idx in pred_gids]
        return pred


def run(trainPath, testPath, config, outPath):
    cs = CellSense(config['area'], config['grid_size'], config['default_std'])
    # get train data
    tr_data = pd.read_csv(trainPath)

    # get test data
    te_data = pd.read_csv(testPath)
    te_label = te_data[['All-Longitude', 'All-Latitude']].values

    # train and predict
    cs.fit(tr_data)
    te_pred = cs.predict(te_data)
    error = [distance(pt1, pt2) for pt1, pt2 in zip(te_pred, te_label)]
    error = sorted(error)

    # dump error
    f_err = outPath + 'tot_error'
    with open(f_err, 'wb') as f:
        pickle.dump(error, f)

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

@ex_alg_cellsense.main
def start(criteria):
    id = criteria["id"]
    configuration = criteria["configuration"]
    # configuration = None
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
    res['algResNumber'] = len(files)
    f_res = open(outPath + 'result.txt', 'w')
    f_res.write(json.dumps(res))
    return res
