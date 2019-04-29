import pandas as pd
import numpy as np
import json
import csv


def salary2int(salary):
    if type(salary) is str:
        salary = salary.strip().replace('$', '').replace(',', '')
        return int(salary)
    else:
        return salary


def default(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError


def write_min_max():
    df = pd.read_csv('./test.csv')
    with open('../../static/skyflow/data/processed/NUMBEO/NUMBEO_columns.csv', 'r') as raw:
        cooked = csv.reader(raw)
        arr = list()
        for record in cooked:
            arr.append(record)
        for a in arr[2:11]:
            a.append(df[a[0]].dropna().min())
            a.append(df[a[0]].dropna().max())
        with open('../../static/skyflow/data/processed/NUMBEO/NUMBEO_columns_extent.csv', 'w') as f:
            f.write('column,detail,min,max\n')
            for a in arr[2:11]:
                f.write(f'{a[0]},{a[1]},{a[2]},{a[3]}\n')
                f.flush()


def get_hist_data():
    columns = ['QoL', 'PP', 'S', 'HC', 'CoL', 'PPI', 'TCT', 'P', 'C']
    df = pd.read_csv('./test.csv')

    print(columns)
    years = df['Year'].unique()
    print(years)

    real_result = dict()
    for c in columns:
        real_result[c] = dict()
        print(c)
        print(np.min(df[c]), np.max(df[c]))
        keep = ~np.isnan(df[c])
        counts, bins = np.histogram(df[c][keep], bins=100)
        real_result[c]['bins'] = list(bins)
        cumsum = np.cumsum(counts)
        real_result[c]['histogram'] = [int(i / np.max(cumsum) * 100) for i in cumsum]

    # for c in columns[4:]:
    #     for i in range(100):
    #         current_row = list()
    #         for year in years:
    #             current_row.append(result)
    #
    #         real_result.append([])
    # print(c, len(counts), len(bins))
    # print(result)
    with open('../../static/skyflow/data/processed/NUMBEO/NUMBEO_histogram.json', 'w') as f:
        f.write(json.dumps(real_result, default=default))
        # f.write(json.dumps(result, indent=4, default=default))
        f.flush()


def check():
    df = pd.read_csv('../../static/skyflow/data/original/NBA Season Data.csv')
    print(df.columns)
    df2 = pd.read_csv('../../static/skyflow/data/original/nba-players-stats/Seasons_Stats.csv')
    print(df2.columns)
    merged = pd.merge(df[['Year', 'Player', 'Player ID', 'TrueSalary']], df2, how='inner', on=['Year', 'Player'])
    print(merged.columns)
    print(df.shape, df2.shape)
    print(merged['TrueSalary'].isna().sum())
    print(merged)
    print(merged.columns)
    merged = merged.drop(columns=['blanl', 'blank2'])
    merged = merged.drop_duplicates(['Year', 'Player'])
    merged['TrueSalary'] = merged['TrueSalary'].apply(salary2int)
    print(merged.columns)
    merged.index.rename('id', inplace=True)
    merged = merged.drop(columns=['Unnamed: 0'])
    # merged = merged.fillna(0)
    columns = list(merged.columns)
    idx = columns.index('Tm')
    del (columns[idx])
    idx = columns.index('Pos')
    del (columns[idx])
    columns.insert(3, 'Pos')
    columns.insert(3, 'Tm')
    print(columns)
    # merged = merged.replace('', 0)
    merged = merged[columns]
    merged = merged[merged['Player ID'] != '#NAME?']
    merged.info()
    merged.to_csv('../../static/skyflow/data/processed/NBA.csv')
    # print(merged.columns)
    # columns = list(merged.columns)
    # merged.info()
    # print(columns.sort())
    # print(columns)
    # print(merged[columns])
    # merged[columns].to_csv('test.csv', mode='w')
    # merged.info()
    # years = df['Year'].unique()
    # for year in years:
    #     print(year)
    #     print(len(df[(df['Year'] == year)]), len(df2[(df2['Year'] == year)]))
    # print()
    # print(df2['Year'].unique())

    # df.info()
    # print(df[['TrueSalary']])


def check_cardinality():
    df = pd.read_csv('../../static/skyflow/data/processed/NBA.csv')
    print(df['Pos'].unique())
    print(df['Tm'].unique())


if __name__ == '__main__':
    # check()
    # check_cardinality()
    get_hist_data()
    write_min_max()
    pass
