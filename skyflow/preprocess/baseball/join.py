import pandas as pd
from pandas import DataFrame
import numpy as np
import json


def drop_y(df):
    # list comprehension of the cols that end with '_y'
    to_drop_x = [x for x in df if x.endswith('_x')]
    to_drop_y = [x for x in df if x.endswith('_y')]
    df.drop(to_drop_x, axis=1, inplace=True)
    df.drop(to_drop_y, axis=1, inplace=True)


def check_na(file):
    merged = pd.read_csv(file)
    print(merged.isna().sum())


def merge():
    l = [(0, 1), (2, 3)]
    for a, b in l:
        print(a, b)
    allstar = pd.read_csv('../../static/skyflow/data/original/baseball-databank/AllstarFull.csv')
    batting = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Batting.csv')
    battingpost = pd.read_csv('../../static/skyflow/data/original/baseball-databank/BattingPost.csv')
    salary = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Salaries.csv')
    pitching = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Pitching.csv')
    fielding = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Fielding.csv')
    # print(allstar, batting)

    merged = pd.merge(batting, salary, how='right', on=['playerID', 'yearID'])
    drop_y(merged)
    merged = pd.merge(merged, pitching, how='left', on=['playerID', 'yearID'])
    drop_y(merged)
    merged = pd.merge(merged, fielding, how='left', on=['playerID', 'yearID'])
    drop_y(merged)

    print(pd.unique(merged['POS']))
    print(merged['POS'].value_counts())
    print(fielding['POS'].value_counts())
    # print(merged.keys())

    merged.to_csv("baseball.csv", mode="w")


def read_file_and_remove_redundancy(file):
    df = pd.read_csv(file)
    df.info()
    keys = ['yearID', 'playerID']
    df.drop_duplicates(keys)
    df.info()


def merge_df():
    keys = ['yearID', 'playerID']
    df = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Salaries.csv')
    df2 = pd.read_csv('../../static/skyflow/data/original/baseball-databank/AwardsPlayers.csv')
    df = pd.merge(df, df2[['yearID', 'playerID', 'awardID']], on=['yearID', 'playerID'], how='left')
    df['awardID'] = df['awardID'].fillna('')
    df = df.drop(columns=['lgID'])
    batting = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Batting.csv')
    batting = batting.drop_duplicates(keys)
    # batting.info()
    batting = batting.drop(columns=['IBB', 'SF', 'GIDP', 'CS', 'SO', 'SH'])
    left_keys = [];
    for key in df.keys():
        if key in batting.keys():
            left_keys.append(key)
    # print(left_keys)
    merge_keys = ['G', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'SB', 'BB', 'HBP']
    for key in merge_keys:
        print(key)
        if key not in left_keys:
            left_keys.append(key)
    # print(left_keys)
    # print(batting.isna().sum())
    df = pd.merge(df, batting[left_keys],
                  on=['yearID', 'playerID'], how='outer')
    print(df.isna().sum())
    # print(df[df['teamID_x'].isna() | df['teamID_y'].isna()][['teamID_x', 'teamID_y']].)
    df['teamID_x'] = df['teamID_x'].combine_first(df['teamID_y'])
    df = df.drop(columns=['teamID_y'])
    df = df.rename(columns={"teamID_x": "teamID"})
    # print(df[df['teamID_x'].isna() | df['teamID_y'].isna()][['teamID_x', 'teamID_y']])
    print(df.isna().sum())
    # print(df.isna().sum())
    # # df = df.fillna(0)

    tmp = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Fielding.csv')
    tmp = tmp.drop_duplicates(keys)
    # # tmp.info()
    # # print(tmp.isna().sum())
    # ids = ['yearID', 'playerID']
    left_keys = []
    for key in df.keys():
        if key in tmp.keys():
            left_keys.append(key)
    merge_keys = ['POS', 'PO', 'A', 'E', 'DP']
    for key in merge_keys:
        if key not in left_keys:
            left_keys.append(key)
    # ids.extend(merge_keys)
    # # print(ids)
    df = pd.merge(df, tmp[left_keys],
                  on=['yearID', 'playerID'], how='outer')
    print(df.isna().sum())
    df = merge_columns(df, ['teamID', 'SB', 'G'])
    print(df.isna().sum())
    df.info()

    tmp = pd.read_csv('../../static/skyflow/data/original/baseball-databank/Pitching.csv')
    tmp = tmp.drop_duplicates(keys)
    # # tmp.info()
    print(tmp.isna().sum())
    tmp = tmp.drop(columns=['lgID', 'stint', 'SH', 'SF', 'GIDP'])
    print(tmp.isna().sum())
    tmp['POS'] = 'P'
    print(tmp.isna().sum())

    # ids = ['yearID', 'playerID']
    # left_keys = []
    # for key in df.keys():
    #     if key in tmp.keys():
    #         left_keys.append(key)
    # merge_keys = ['W', 'L', 'SHO', 'SV', 'H', 'ER', 'HR', 'BB', 'SO','R','BK']
    # for key in merge_keys:
    #     if key not in left_keys:
    #         left_keys.append(key)
    # ids.extend(merge_keys)
    # # print(ids)
    df = pd.merge(df, tmp,
                  on=['yearID', 'playerID'], how='outer')
    print(df.isna().sum())
    df = merge_columns(df, ['teamID', 'R', 'G', 'H', 'HR', 'BB', 'HBP', 'POS', ])
    # print(df.isna().sum())
    df.info()
    columns = list(df.columns)
    idx = columns.index('POS')
    del (columns[idx])
    idx = columns.index('awardID')
    del (columns[idx])
    columns.insert(3, 'POS')
    columns.insert(3, 'awardID')
    df.index.rename('id', inplace=True)
    print(columns)
    df = df[columns]
    df.to_csv("../../static/skyflow/data/processed/baseball.csv", mode="w")


def merge_columns(df, columns):
    for c in columns:
        df[c + '_x'] = df[c + '_x'].combine_first(df[c + '_y'])
        df = df.drop(columns=[c + '_y'])
        df = df.rename(columns={c + "_x": c})
    return df


def default(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError


def get_hist_data():
    df = pd.read_csv('../../static/skyflow/data/processed/baseball.csv')
    columns = list(df.columns)
    print(columns)
    years = df['Year'].unique()
    print(years)

    real_result = dict()
    for c in columns[6:]:
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
    with open('../../static/skyflow/data/processed/MLB_histogram.json', 'w') as f:
        f.write(json.dumps(real_result, default=default))
        # f.write(json.dumps(result, indent=4, default=default))
        f.flush()


def mlb_pipeline():
    # no redundant data in salaries
    # read_file_and_remove_redundancy('../../static/skyflow/data/original/baseball-databank/Salaries.csv')
    merge_df()


if __name__ == '__main__':
    # check_na('../../static/skyflow/data/processed/baseball.csv')

    # mlb_pipeline()
    get_hist_data()
    # no
