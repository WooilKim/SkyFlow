import numpy as np
import pandas as pd


def nba_setting():
    df = pd.read_csv('../../static/skyflow/data/original/NBA Season Data.csv')
    df = df.dropna(subset=['TrueSalary'])
    df = df.drop(
        columns=['..1', '.', 'Production', 'Prod-Gm', 'Adjusted Production', '%Min', 'Age on Feb 1', 'Rounded Age'])
    for c in df.columns:
        print(c, df[c].isna().sum())

    # df = pd.DataFrame(np.where(df == 'something', df + 'add a string', df + 'add a value'),
    #                   index=df.index,
    #                   columns=df.columns)
    print(df['TrueSalary'].head())
    df['TrueSalary'] = df['TrueSalary'].apply(salary2int)
    df = df[df['Player ID'] != '#NAME?']
    # print(df[['Player', 'Player ID']])
    print(df['Player ID'].value_counts())
    print(df[['Tm Sum', 'Tm Sum.1']])
    # print(df.dtypes)
    df.info(verbose=True)

    columns = list(df.columns)
    idx = columns.index('Player ID')
    del columns[idx]
    columns.insert(1, 'Player ID')
    idx = columns.index('TrueSalary')
    del columns[idx]
    columns.insert(5, 'TrueSalary')
    dropped_columns = [c for c in columns if not c.endswith('.1') and not c.endswith('.2')]

    print(dropped_columns)
    df = df[dropped_columns]
    df.index.rename('id', inplace=True)
    df.to_csv('../../static/skyflow/data/processed/NBA_setting.csv', mode='w')


def salary2int(salary):
    if type(salary) is str:
        salary = salary.strip().replace('$', '').replace(',', '')
        return int(salary)
    else:
        return salary


if __name__ == '__main__':
    nba_setting()
