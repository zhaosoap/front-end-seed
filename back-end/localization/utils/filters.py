# encoding: utf-8
import numpy as np
import copy
from sklearn.decomposition import NMF

class Filter:
    def __init__(self):
        pass

    def mean_filter(self, raw_traj, window_size, n_iter):
        window_size /= 2
        traj = copy.copy(raw_traj)
        for _ in xrange(n_iter):
            new_traj = []
            for i in xrange(len(traj)):
                if i - window_size < 0 or i + window_size >= len(traj):
                    new_traj.append(traj[i])
                else:
                    # new_traj.append(np.mean(traj[i-window_size:i+window_size+1],axis=0))
                    new_traj.append(np.mean(np.vstack((traj[i-window_size:i], traj[i+1:i+window_size+1])),axis=0))
            traj = copy.copy(new_traj)

        return np.array(traj)

    # def median_filter(self, raw_traj, window_size, n_iter):
        # window_size /= 2
        # traj = copy.copy(raw_traj)
        # for _ in xrange(n_iter):
            # new_traj = []


class MatrixFactorization:
    def __init__(self):
        self.nmf = NMF()

    def fit(self, X):
        self.nmf.fit(X)
        u = self.nmf.transform(X)
        return u.dot(self.nmf.components_)

    def predict(self, X):
        u = self.nmf.transform(X)
        return u.dot(self.nmf.components_)
