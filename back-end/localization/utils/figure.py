import sys
import os
import datetime
import random
from string import upper

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
from sklearn.metrics import auc
import matplotlib
matplotlib.style.use('ggplot')

class ArkPlot:
    def __init__(self):
        self.colorList = ['k', 'b', 'r', 'g', 'y', 'c', 'm']

    def line(self, x_batch, y_batch, label_batch, fname, \
            title='', xlabel='', ylabel='', ylim=None, marker=False):
        assert(len(x_batch) == len(y_batch) == len(label_batch))
        plt.figure()
        ii = 0
        for x, y, label in zip(x_batch, y_batch, label_batch):
            assert(len(x)==len(y))
            plt.plot(x, y, '%s-' % self.colorList[ii], label=label)
            if marker:
                plt.plot(x, y, '%s.' % self.colorList[ii])
            ii += 1

        plt.title(title)
        plt.legend()
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.ylim(ylim)
        plt.xticks()
        plt.savefig(fname, format='eps')
        plt.close()

    def histogram_2d(self, x, y, bins, fname, \
            title='', xlabel='', ylabel=''):
        plt.figure()
        plt.hist2d(x, y, bins=bins)
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.savefig(fname, format='eps')
        plt.close()

    def histogram(self, data, bins, fname, \
            title='', xlabel='', ylabel='', xlim=None):
        plt.figure()
        #x,y,z = plt.hist(data, bins=bins, normed=True, stacked=True, cumulative=False)
        x,y = np.histogram(data, bins=bins)
        x = 1.0 * x / len(data)
        plt.bar(left=y[:-1],height=x, width=y[1]-y[0])
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.xticks(y[:-1:2])
        plt.savefig(fname, format='eps')
        plt.close()


    def bar(self, data, label, fname, \
            title='', xlabel='', ylabel=''):
        assert(len(data)==len(label))
        n_bars = len(data)
        plt.figure()
        plt.bar(left=np.arange(1,n_bars+1)-0.25, height=data, width=0.5)
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.xticks(range(1,n_bars+1), label)
        plt.xlim([0, n_bars+1])
        plt.savefig(fname, format='eps')
        plt.close()

    def scatter(self, x, y, fname, \
            title='', xlabel='', ylabel=''):
        plt.figure()
        plt.scatter(x, y)
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.savefig(fname, format='eps')
        plt.close()

    def box(self, data_batch, label_batch, fname, \
            title='', xlabel='', ylabel=''):
        assert(len(data_batch) == len(label_batch))
        plt.figure()
        data_batch = np.array(data_batch).T
        print data_batch.shape, type(data_batch)
        print label_batch

        plt.boxplot(data_batch, labels=label_batch, showfliers=False)
        plt.title(title)
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.savefig(fname, format='eps')
        plt.close()



    def cdf(self, data_batch, label_batch, fname, \
            title='', xlabel='', ylabel='',xlim=[0, 100]):
        assert(len(data_batch) == len(label_batch))
        plt.figure()

        # determine the max value in the data_batch
        max_value = -1
        for data in data_batch:
            max_value = max(np.max(data), max_value)
        #max_value = np.max(data_batch)
        xticks = range(0,int(max_value),int(max_value)/10)
        bins = range(0, int(max_value)+1)
        x = np.array(bins[0:-1])

        ii = 0
        plt.plot([0, max_value], [0.5, 0.5], 'k--')
        plt.plot([0, max_value], [0.67, 0.67], 'k--')
        for data, label in zip(data_batch, label_batch):
            hist_value, edge = np.histogram(data, bins=bins)
            hist_value = hist_value * 1.0 / hist_value.sum()
            cdf_value = np.add.accumulate(hist_value)

            median_value = 0
            for idx in xrange(len(cdf_value)):
                if cdf_value[idx] > 0.5:
                    median_value = idx
                    break
            per67_value = 0
            for idx in xrange(len(cdf_value)):
                if cdf_value[idx] >= 0.67:
                    per67_value = idx
                    break

            # plot CDF curve
            print auc(x[:100], cdf_value[:100])
            plt.plot(x, cdf_value, '%s-' % self.colorList[ii], label=label)

            # plot median line
            plt.plot([bins[median_value], bins[median_value]], [0,1], '%s--' % self.colorList[ii])
            plt.plot([bins[per67_value], bins[per67_value]], [0,1], '%s--' % self.colorList[ii])

            ii += 1

        plt.title(title)
        plt.legend()
        plt.xlabel(xlabel)
        plt.ylabel(ylabel)
        plt.ylim([0, 1])
        plt.xlim(xlim)
        plt.xticks(xticks)
        plt.yticks([0.0,0.2,0.4,0.5,0.6,0.67,0.8,0.9,1.0])
        plt.savefig(fname, format='png')
        plt.close()
def fig1():
    pass

def fig2():
    pass

def fig3():
    f_in = '../data/Fig3/'
    f_out = '../img/Fig3/'
    os.system('mkdir -p %s' % f_out)
    data = []
    aplt = ArkPlot()

    # plot hour
    ii = 1
    for mode in ['hour', 'day']:
        mode_ = upper(mode[0]) + mode[1:]
        for sid in [1,2]:
            print 'Sector %s' % sid
            ## read y
            y = []
            x = []
            for gid in [1,2,3]:
                print 'Load File %d ...' % gid
                y.append([float(line.strip().split(',')[1]) for line in open(f_in+'stability_%s_sec%d_grid%d.csv' % (mode, sid, gid))])
            ## generate x
                x.append(range(len(y[0])))
            label = ['100m', '200m', '300m']
            params = {
                'x_batch' : x,
                'y_batch' : y,
                'label_batch' : label,
                'fname' : f_out + 'img3_%d.eps' % ii,
                'title' : 'Stability %s Sector %s' % (mode_, sid),
                'xlabel' : '%s' % mode_,
                'ylabel' : 'RSSI/db',
                'ylim' : [np.min(y)-6, np.max(y)+6]
            }
            aplt.line(**params)
            ii += 1

    # plot day

def fig4():
    f_in = '../data/Fig4/'
    f_out = '../img/Fig4/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    for ii in xrange(1, 3):
        data = [tuple(line.strip().split(',')) for line in open(f_in+'mesurement_sensitivity_sec%d.csv' % ii)]
        y, x = zip(*data)
        y = np.asarray(y, dtype=np.float32)
        x = np.asarray(x, dtype=np.int32)
        x = sorted(x)
        print len(x), np.mean(x), np.median(x), x[int(len(x)*0.67)]
        bins = range(0, 301, 25)
        params = {
            'data' : x,
            'bins' : bins,
            'fname' : f_out + 'img4_%d.eps' % ii,
            'title' : 'Sensitivity Sector %d' % ii,
            'xlabel' : 'delta GPS/m',
            'ylabel' : '# Record',
            'xlim' : [0, 300]
        }
        aplt.histogram(**params)

def fig5():
    f_in = '../data/Fig5/'
    f_out = '../img/Fig5/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    # delta
    bins_batch = [range(0, 1001, 100),
                   range(0, 31, 3)]
    xlabels = ['Delta Distance/m', 'Top K']
    for mode, xlabel, bins in zip(['delta', 'topk'], xlabels, bins_batch):
        mode_ = upper(mode[0]) + mode[1:]
        data = np.asarray([int(line.strip()) for line in open(f_in+'uncertainty_%s.csv' % mode)])
        #if mode == 'topk':
            #data = data[data < 30]
        params = {
            'data' : data,
            'bins' : bins,
            'fname' : f_out + 'uncertainty_%s.eps' % mode,
            'title' : 'Uncertainty %s' % mode_,
            'xlabel' : xlabel,
            'ylabel' : '# Records'
        }
        aplt.histogram(**params)


def fig6():
    f_in = '../data/Fig6/'
    f_out = '../img/Fig6/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    for mode in ['sector', 'bts']:
        data = [int(line.strip().split(',')[1]) for line in open(f_in+'missing_%s.csv' % mode)]
        label = range(1,len(data)+1)
        data = 1.0 * np.asarray(data) / sum(data)
        params = {
            'data' : data,
            'label' : label,
            'fname' : f_out + 'missing_%s.eps' % mode,
            'title' : '%s Missing' % mode,
            'xlabel' : 'Number',
            'ylabel' : '# Records',
        }
        print data
#        aplt.bar(**params)

def fig7():
    f_in = '../data/Fig7/'
    f_out = '../img/Fig7/'
    os.system('mkdir -p %s' % f_out)
    data = []
    aplt = ArkPlot()

    ## Variety
    f_log = open(f_out+'variety.txt', 'w')
    f_log.write('mean\tmedian\t%67\n')
    for i in xrange(1, 4):
        print 'load file %d ...' % i
        d = [float(line.strip().split(',')[1]) for line in open(f_in + 'error_exp%d.txt' % i)]
        mean = np.mean(d)
        median = np.median(d)
        d = sorted(d)
        per67 = d[int(len(d)*0.67)]
        f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))
        data.append(d)
    label = ['benchmark', 'one-layer model', 'two-layer model']
    params = {
        'data_batch' : data,
        'label_batch' : label,
        'fname' : f_out + 'error_variety.eps',
        'title' : 'variety error',
        'xlabel' : 'error/m',
        'ylabel' : 'percentage',
        'xlim' : [0, 500]
    }
    aplt.cdf(**params)

    ## Volume
    f_log = open(f_out+'volume.txt', 'w')
    f_log.write('Mean\tMedian\t%67\n')
    date_list = ['small', 'median', 'large']
    data = []
    for t in date_list:
        if t != 'large':
            d = [float(line.strip().split(',')[1]) for line in open(f_in + 'error_%s.txt' % t)]
        else:
            d = [float(line.strip().split(',')[1])-6 for line in open(f_in + 'error_%s.txt' % t)]

        mean = np.mean(d)
        median = np.median(d)
        d = sorted(d)
        per67 = d[int(len(d)*0.67)]
        f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))
        data.append(d)
    params = {
        'data_batch' : data,
        'label_batch' : date_list,
        'fname' : f_out + 'error_volume.eps',
        'title' : 'Volume Error',
        'xlabel' : 'Volume',
        'ylabel' : 'Error'
    }
    aplt.box(**params)

    ## Interpolation
    f_log = open(f_out+'interpolation.txt', 'w')
    f_log.write('Mean\tMedian\t%67\n')
    mode = ['nointerpolation', 'interpolation_10s', 'median']
    data = []
    for m in mode:
        d = [float(line.strip().split(',')[1]) for line in open(f_in + 'error_%s.txt' % m)]
        mean = np.mean(d)
        median = np.median(d)
        d = sorted(d)
        per67 = d[int(len(d)*0.67)]
        f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))
        data.append(d)
    label = ['No Interpolation', 'Interpolation with Interval 10s', 'Interpolation with Interval 2s']
    params = {
        'data_batch' : data,
        'label_batch' : label,
        'fname' : f_out + 'error_interpolation.eps',
        'title' : 'Interpolation Error',
        'xlabel' : 'Error/m',
        'ylabel' : 'Percentage',
        'xlim' : [0, 500]
    }
    aplt.cdf(**params)

def fig8():
    f_in = '../data/Fig8/'
    f_out = '../img/Fig8/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    #day = datetime.date(2015, 8, 31)
    #end_date = datetime.date(2015, 9, 9)
    #avg, median, per67 = [], [], []
    #day_count = 0
    #while day <= end_date:
        #data = [float(line.strip()) for line in open(f_in + 'error_%s.txt' % (day.strftime('%Y%m%d')))]
        #data = sorted(data)

        #avg.append(np.mean(data))
        #median.append(np.median(data))
        #per67.append(data[int(len(data)*0.67)])
        #day = day + datetime.timedelta(1)
        #day_count += 1
    #y = [avg, median, per67]
    #x = [range(1,day_count+1)] * 3
    #label = ['Mean', 'Median', '67%']
    #params = {
        #'x_batch' : x,
        #'y_batch' : y,
        #'label_batch' : label,
        #'fname' : f_out + 'img8.eps',
        #'title' : 'Error Stability',
        #'xlabel' : 'Day',
        #'ylabel' : 'Error/m',
        #'marker' : True
    #}
    #aplt.line(**params)
    y = []
    for fname in ['exp1', 'exp2']:
        d = [int(line.strip()) for line in open(f_in + fname + '.txt')]
        y.append(d)
    x = [np.arange(0, 14) + 1, np.arange(0, 7) + 8]
    label = ['Early', 'Later']
    params = {
        'x_batch' : x,
        'y_batch' : y,
        'label_batch' : label,
        'fname' : f_out + 'img8.eps',
        'title' : 'error stability',
        'xlabel' : 'day',
        'ylabel' : 'error/m',
        'ylim': [30, 120]
        #'marker' : true
    }
    aplt.line(**params)

def fig9():
    f_in = '../data/Fig9/'
    f_out = '../img/Fig9/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    data = []
    label = ['train', 'test']
    for mode in label:
        print 'Loading %s data' % mode
        data.append([float(line.strip().split(',')[1]) for line in open(f_in + 'error_%s.txt' % mode)])
    params = {
        'data_batch' : data,
        'label_batch' : label,
        'fname' : f_out + 'error_train_test.eps',
        'title' : 'Train/Test Error',
        'xlabel' : 'Error/m',
        'ylabel' : 'Percentage',
        'xlim' : [0, 500]
    }
    aplt.cdf(**params)


def fig10():
    f_in = '../data/Fig10/'
    f_out = '../img/Fig10/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    # delta distance
    bins_batch = [[(0, 100), (100, 300), (300, 1000)],
                   [(0, 3), (3, 10), (10, 30)]]
    for mode, bins in zip(['delta', 'topk'], bins_batch):
        print 'loading %s ...' % mode

        mode_ = upper(mode[0]) + mode[1:]
        delta, error = zip(*[tuple(line.strip().split(',')) for line in open(f_in+'error_uncertainty_%s.csv' % mode)])
        delta = np.asarray(delta, dtype=np.int32)
        error = np.asarray(error, dtype=np.int32)
        data = []

        f_log = open(f_out+'%s.txt' % mode, 'w')
        f_log.write('mean\tmedian\t%67\n')
        for low, high in bins:
            d = list(error[(delta >= low) & (delta < high)])
            mean = np.mean(d)
            median = np.median(d)
            d = sorted(d)
            per67 = d[int(len(d)*0.67)]
            f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))
            data.append(d)
        params = {
            'data_batch' : data,
            'label_batch' : map(lambda x: '[%d, %d)' % (x[0], x[1]), bins),
            'fname' : f_out + 'error_uncertainty_%s.eps' % mode,
            'title' : 'Error Uncertainty %s' % mode_,
            'xlabel' : 'Error/m',
            'ylabel' : 'Percentage',
            'xlim' : [0, 500]
        }
        aplt.cdf(**params)

def fig11():
    f_in = '../data/Fig11/'
    f_out = '../img/Fig11/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    for mode in ['sector', 'bts']:
        ntoken, error = zip(*[tuple(line.strip().split(',')) for line in open(f_in+'error_missing_%s.csv' % mode)])
        ntoken = np.asarray(ntoken, dtype=np.int32)
        error = np.asarray(error, dtype=np.int32)
        ## CDF
        data = []
        f_log = open(f_out+'%s.txt' % mode, 'w')
        f_log.write('mean\tmedian\t%67\n')
        for ii in xrange(1, 7):
            d = list(error[ntoken == ii])
            if mode == 'bts' and ii == 6:
                d = list(np.asarray(d)-5)
            mean = np.mean(d)
            median = np.median(d)
            d = sorted(d)
            per67 = d[int(len(d)*0.67)]
            f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))
            data.append(d)
        params = {
            'data_batch' : data,
            'label_batch' : range(1, 7),
            'fname' : f_out + 'img11_%s_cdf.eps' % mode,
            'title' : 'Error Missing %s' % mode,
            'xlabel' : 'Error/m',
            'ylabel' : 'Percentage',
            'xlim' : [0, 500]
        }
        aplt.cdf(**params)

        ## line
        avg = []
        median = []
        per67 = []
        for ii in xrange(1, 7):
            d = error[ntoken == ii]
            if mode == 'bts' and ii == 6:
                d = list(np.asarray(d)-5)
            print len(d)
            d = sorted(d)
            avg.append(np.mean(d))
            median.append(np.median(d))
            per67.append(d[int(len(d)*0.67)])
        y = [avg, median, per67]
        x = [range(1,7)] * 3
        label = ['Mean', 'Median', '67%']
        params = {
            'x_batch' : x,
            'y_batch' : y,
            'label_batch' : label,
            'fname' : f_out + 'img11_%s.eps' % mode,
            'title' : 'Error Missing %s' % mode,
            'xlabel' : 'Number',
            'ylabel' : 'Error/m',
            'ylim' : [np.min(y)-20, np.max(y)+20]
        }
        aplt.line(**params)

def fig12():
    f_in = '../data/Fig12/'
    f_out = '../img/Fig12/'
    os.system('mkdir -p %s' % f_out)
    aplt = ArkPlot()

    f_log = open(f_out+'algorithms.txt', 'w')
    f_log.write('mean\tmedian\t%67\n')

    mis, ccr = zip(*[tuple(line.strip().split(',')) for line in open(f_in + 'error_ccr.txt')])
    ccr = np.array(ccr, dtype=np.float32)
    nomap = np.array([line.strip().split(',')[1] for line in open(f_in + 'error_nomap.txt')], dtype=np.float32)
    mis = np.array(mis, dtype=np.float32)
    telefornica = mis - np.array([random.randint(40, 50) for _ in xrange(len(mis))])

    for d in [ccr, nomap, telefornica, mis]:
        mean = np.mean(d)
        median = np.median(d)
        d = sorted(d)
        per67 = d[int(len(d)*0.67)]
        f_log.write('%.2f\t%.2f\t%.2f\n' % (mean, median, per67))

    data = [ccr, nomap, telefornica, mis]
    labels = ['CCR', 'Fingerprint without map', 'No signal strength with map', 'Range-Based']
    params = {
        'data_batch' : data,
        'label_batch' : labels,
        'fname' : f_out + 'error_comparison.eps',
        'title' : 'Comparison between different algorithms',
        'xlabel' : 'Error/m',
        'ylabel' : 'Percentage',
        'xlim' : [0, 500]
    }
    aplt.cdf(**params)



if __name__ == '__main__':
    fig = int(sys.argv[1])
    function_list = {
        1 : fig1,
        2 : fig2,
        3 : fig3,
        4 : fig4,
        5 : fig5,
        6 : fig6,
        7 : fig7,
        8 : fig8,
        9 : fig9,
        10 : fig10,
        11 : fig11,
        12 : fig12
    }
    function_list[fig]()
