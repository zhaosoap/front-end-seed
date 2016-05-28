import numpy as np
import math as Math

rc = 6378137
rj = 6356725

def rad(d):
    return d * Math.pi / 180.0

def compute_error(true_pt, pred_pt):
    lat1 = float(true_pt[1])
    lng1 = float(true_pt[0])
    lat2 = float(pred_pt[1])
    lng2 = float(pred_pt[0])
    radLat1 = rad(lat1)
    radLat2 = rad(lat2)
    a = radLat1 - radLat2
    b = rad(lng1) - rad(lng2)
    s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)))
    s = s * 6378.137
    s = round(s * 10000) / 10
    return s

def to_string(data):
    return map(lambda x: str(x), data)

def zip_name(name, data):
    return zip([name]*len(data), data)

def preprocess_(dataset):
    n, m = dataset.shape
    dataset = dataset.astype(np.float32)

    # feature standardization
    for i in range(m):
        mean = np.mean(dataset[:, i])
        std = np.std(dataset[:, i])
        dataset[:, i] = (dataset[:, i] - mean) / std if std else 0

    return dataset

def preprocess(tr_feature, te_feature=None):
    # feature size of train data and test data must be equal
    assert(tr_feature.shape[1] == te_feature.shape[1])

    if te_feature is not None:
        tr_size = tr_feature.shape[0]
        te_size = te_feature.shape[0]

        # combine train data and test data
        dataset = np.vstack((tr_feature, te_feature))

        # preprocessing data
        dataset = preprocess_(dataset)

        # split dataset to train data and test data
        tr_feature = dataset[0:tr_size, :]
        te_feature = dataset[tr_size:, :]
        tr_feature = tr_feature.astype(np.float32)
        te_feature = te_feature.astype(np.float32)
        return tr_feature, te_feature
    else:
        # preprocessing data
        tr_feature = preprocess_(tr_feature)
        tr_feature = tr_feature.astype(np.float32)
        return tr_feature

def make_vocab(tr_ids, te_ids=None):
    if te_ids is not None:
        # check whether number of id features are same between train and test
        assert(len(tr_ids) == len(te_ids))
        dataset = tr_ids + te_ids
    else:
        dataset = tr_ids

    # Stack dataset itself
    dataset = reduce(lambda x,y: x+y, dataset)

    unique_ids = set(dataset)

    return len(set(dataset)), dict(zip(unique_ids, range(len(unique_ids))))
