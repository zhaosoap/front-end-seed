# coding : utf8
import pandas as pd
import numpy as np
import time

target_header = open('header.csv').readline().strip().split(',')

def trans_3g(fnames):
    header = ['imsi', 'Time', 'mr_lon', 'mr_lat']
    for i in xrange(1, 7):
        header += ['All-Neighbor RxLev (dBm) (Sorted)[%d]'%i, 'rscp_%d'%i, 'ecno_%d'%i,
                   'All-Neighbor LAC (Sorted)[%d]'%i, 'All-Neighbor Cell Id (Sorted)[%d]'%i, 'lon_%d'%i,
                   'lat_%d'%i, 'id_%d'%i, 'height_%d'%i,
                   'azimuth_%d'%i, 'mdtilt_%d'%i, 'edtilt_%d'%i,
                   'btstype_%d'%i, 'company_%d'%i]
    header += ['n_sector', 'n_bts', 'All-Longitude', 'All-Latitude']

    for fname in fnames:
        df = pd.read_csv(fname, header=None, names=header)
        size = len(df)
        ndf = pd.DataFrame()

        # set all columns to one first
        for field in target_header:
            ndf[field] = np.ones(size)

        for field in ['Time', 'All-Longitude', 'All-Latitude']:
            ndf[field] = df[field]
        ndf['All-LAC'] = df['All-Neighbor LAC (Sorted)[1]']
        ndf['All-Cell Id'] = df['All-Neighbor Cell Id (Sorted)[1]']
        ndf['All-RxLev Full (dBm)'] = df['All-Neighbor RxLev (dBm) (Sorted)[1]']
        ndf['All-RxLev Sub (dBm)'] = df['All-Neighbor RxLev (dBm) (Sorted)[1]']
        for i in xrange(1, 7):
            for field in ['All-Neighbor RxLev (dBm) (Sorted)[%d]'%i, 'All-Neighbor LAC (Sorted)[%d]'%i, 'All-Neighbor Cell Id (Sorted)[%d]'%i]:
                ndf[field] = df[field]

        ndf = ndf[target_header]
        ndf.to_csv('trans_%s'%fname, index=False)

def trans_4g(fnames):
    header = ['Time', 'IMSI', 'SRNCID',
              'BestCellID', 'SRNTI', 'RAB',
              'Delay', 'UE_TXPower', 'LCS_BIT',
              'All-Longitude', 'All-Latitude']
    for i in xrange(1, 7):
        header += ['All-Neighbor LAC (Sorted)[%d]'%i,
                   'All-Neighbor Cell Id (Sorted)[%d]'%i,
                   'rscp_%d'%i, 'ecno_%d'%i, 'rtt_%d'%i, 'usrxtx_%d'%i]

    for fname in fnames:
        df = pd.read_csv(fname, header=0, names=header)
        size = len(df)
        ndf = pd.DataFrame()
        # set all columns to one first
        for field in target_header:
            ndf[field] = np.ones(size)
        for field in ['Time', 'All-Longitude', 'All-Latitude']:
            if field == 'Time':
                try:
                    ndf[field] = map(lambda t: time.mktime(time.strptime(t, '%Y-%m-%d %H:%M:%S.%f')), df[field].values)
                except Exception:
                    ndf[field] = np.ones(size)
            else:
                ndf[field] = df[field]
        for i in xrange(1, 7):
            df['All-Neighbor RxLev (dBm) (Sorted)[%d]'%i] = df['rscp_%d'%i] - df['ecno_%d'%i]
            for field in ['All-Neighbor RxLev (dBm) (Sorted)[%d]'%i, 'All-Neighbor LAC (Sorted)[%d]'%i, 'All-Neighbor Cell Id (Sorted)[%d]'%i]:
                ndf[field] = df[field]
        ndf['All-LAC'] = df['All-Neighbor LAC (Sorted)[1]']
        ndf['All-Cell Id'] = df['All-Neighbor Cell Id (Sorted)[1]']
        ndf['All-RxLev Full (dBm)'] = df['All-Neighbor RxLev (dBm) (Sorted)[1]']
        ndf['All-RxLev Sub (dBm)'] = df['All-Neighbor RxLev (dBm) (Sorted)[1]']

        ndf = ndf[target_header]
        ndf.to_csv('trans_%s'%fname, index=False)

if __name__ == '__main__':
    # trans_3g(['train_20150820_56.csv', 'train_20150821_56.csv', 'train_20150822_56.csv'])
    trans_4g(['forward_demo.csv', 'backward1_demo.csv', 'backward2_demo.csv', 'backward3_demo.csv', 'forwardbackward4_demo.csv', 'forwardbackward5_demo.csv'])
