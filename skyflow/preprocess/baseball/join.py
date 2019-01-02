import pandas as pd
from pandas import DataFrame

def drop_y(df):
    # list comprehension of the cols that end with '_y'
    to_drop_x = [x for x in df if x.endswith('_x')]
    to_drop_y = [x for x in df if x.endswith('_y')]
    df.drop(to_drop_x, axis=1, inplace=True)
    df.drop(to_drop_y, axis=1, inplace=True)

if __name__ == '__main__':
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
