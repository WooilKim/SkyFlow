import numpy as np
import csv, math, json, pprint
from sklearn.manifold import TSNE
import pandas as pd
from operator import itemgetter


def pipeline():
    # raw file : NBA Season Data.csv
    # rawfile = "../../static/skyflow/data/original/NBA Season Data.csv"
    # rawfile_rows = read(rawfile)

    rows = read('../../static/skyflow/data/original/NBA_redundancy_erased.csv')

    # 중복되는 데이터가 있어서 중복 제거 -> NBA_redundancy_erased.csv
    columns_needed = ['Year', 'Player', 'nameID', 'Tm', 'G', 'ORB%', 'DRB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'Shot%']
    used = set()
    tmp = [row['Year'] for row in rows]
    years = [x for x in tmp if x not in used and (used.add(x) or True)]

    # write players.json
    tmp = [row['Player'] for row in rows]
    players = list(set(tmp))
    players.sort()
    for row in rows:
        row['nameID'] = players.index(row['Player'])
    for i, player in enumerate(players):
        players[i] = {'id': i, 'name': player}

    playersJson = json.dumps({'players': players}, indent=4)
    with open('players.json', 'w') as f:
        f.write(playersJson)
        f.flush()

    # test_years = ['2016']

    # Column picked
    selected_rows = pick_column_needed(rows, columns_needed)
    key_modified_rows = list()
    cks = ['year', 'player', 'nameID', 'tm']
    value_origin = ['G', 'ORB%', 'DRB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'Shot%']
    values = ['g', 'orb', 'drb', 'trb', 'ast', 'stk', 'blk', 'shot']
    joined = list(zip(cks, columns_needed))
    print([(a, b) for a, b in joined])
    for row in selected_rows:
        krow = {a: row[b] for a, b in joined}
        krow['values'] = {a: row[b] for a, b in list(zip(values, value_origin))}
        key_modified_rows.append(krow)
    #
    #
    # Normalize data
    #
    # normalized_rows = get_normalized_data(selected_rows)
    # normalized_list = dict2list(normalized_rows, columns_needed)

    for i, row in enumerate(key_modified_rows):
        row['id'] = i
    # Dominance graph build
    #
    # print(selected_list)
    for year in years:
        print(year)
        data_list = [(x['id'], list(map(float, list(x['values'].values())))) for x in
                     list(filter(lambda x: x['year'] == year, key_modified_rows))]
        nd_dom, nd_dom_by = find_dominating_list(data_list)
        print(data_list)
        for i, d in enumerate(data_list):
            key_modified_rows[d[0]]['all_dom'] = nd_dom[i]
            key_modified_rows[d[0]]['all_dom_by'] = nd_dom_by[i]
            key_modified_rows[d[0]]['dir_dom'] = [x for x in nd_dom[i]]
        # dominated_by_list = find_dominated_by_list(data_list)
        # dominance_score = find_dominate_score(data_list)
        #
        # for i in dominating_list.keys():
        #     selected_rows[i]['dominating'] = dominating_list[i]
        #     selected_rows[i]['dominated_by'] = dominated_by_list[i]
        #     selected_rows[i]['dominance_score'] = dominance_score[i]

        # skylines = classify_skylines(data_list)
        # for i, skyline in enumerate(skylines):
        #     for id in skyline:
        #         selected_rows[id]['nth-skyline'] = i + 1

    for row in key_modified_rows:
        erase_list = list()
        for dom_id in row['dir_dom']:
            l = [True if dom_id in key_modified_rows[d]['dir_dom'] else False for d in row['dir_dom']]
            if any(l):
                erase_list.append(dom_id)
        for i in erase_list:
            row['dir_dom'].remove(i)

    for row in key_modified_rows:
        row['dir_dom_by'] = list()

    for row in key_modified_rows:
        for dom_id in row['dir_dom']:
            key_modified_rows[dom_id]['dir_dom_by'].append(row['id'])

    print()
    # X_embedded = t_SNE(selected_rows, columns_needed)

    # 1th skyline

    print()
    with open('../../static/skyflow/data/processed/NBA_dominance.json', 'w')as f:
        f.write(json.dumps(key_modified_rows))
        f.flush()


def absent_list():
    rows = readJSON('../../static/skyflow/data/processed/NBA_dominance.json')
    years = list()
    for year in range(1978, 2016):
        years.append([x['nameID'] for x in list(filter(lambda x: int(x['year']) == year, rows))])
    print(years)
    absents = list()
    for year in range(len(years)):
        absents.append(list())
    for year in range(len(years) - 1):
        for x in years[year]:
            if x not in years[year + 1] and x not in absents[year]:
                absents[year + 1].append(x)

    for year in range(1, len(years)):
        for x in years[year]:
            if x not in years[year - 1] and x not in absents[year - 1]:
                absents[year - 1].append(x)

    print(absents)
    for a in absents:
        print(len(a))


def nth_skyline():
    rows = readJSON('../../static/skyflow/data/processed/NBA_dominance.json')
    already_counted = []
    for row in rows:
        if len(row['all_dom_by']) == 0:
            row['nth-skyline'] = 0
            already_counted.append(row['id'])
    for i in range(1, 8):
        candidate = []
        for row in rows:
            if 'nth-skyline' not in row:
                if all([True if x in already_counted else False for x in row['all_dom_by']]):
                    row['nth-skyline'] = i
                    candidate.append(row['id'])
        print(i, candidate)
        already_counted.extend(candidate)

    for row in rows:
        keys = row['values'].keys()
        for key in keys:
            row['values'][key] = float(row['values'][key])
        row['dominance'] = len(row['all_dom'])
        if row['nth-skyline'] > 3:
            print(row)
    # print(rows.filter(lambda x: x if ))
    with open('../../static/skyflow/data/processed/NBA_nth.json', 'w')as f:
        f.write(json.dumps(rows))
        f.flush()
    print()

    # 1 level, 2, 3 level Skyline
    # print('write_process started')
    # list2file(dominating_list, '../data/dominating_list.csv')
    # list2file(dominated_by_list, '../data/dominated_by_list.csv')
    # list2file_1elem(dominance_score, '../data/dominance_score.csv')

    # list2jsonfile(dominating_list, '../data/dominating_list.json')
    # list2jsonfile(dominated_by_list, '../data/dominated_by_list.json')
    # list2jsonfile(dominance_score, '../data/dominance_score.json')
    #

    # list2file(skylines, '../data/skylines.csv')
    # list2jsonfile(skylines, '../data/skylines.json')
    # print(skylines)
    #
    # then what?
    #
    # t-SNE
    #
    # X_embedded = t_SNE(normalized_rows, columns_needed)
    # write_tsne_coordinate(X_embedded, '../data/tsne.json')

    #
    #
    # Measure subspace size
    #
    #
    #
    pass


def compareline_id():
    rows = readJSON('../../static/skyflow/data/processed/NBA_nth.json')
    results = []
    for row in rows:
        id = row['id']
        nth = row['nth-skyline']
        dom = []
        dom_by = []
        conflict = []
        for pid in row['all_dom']:
            nth = rows[pid]['nth-skyline']
            while (len(dom) <= nth):
                dom.append([])
            dom[nth].append(pid)
        for pid in row['all_dom_by']:
            nth = rows[pid]['nth-skyline']
            while (len(dom_by) <= nth):
                dom_by.append([])
            dom_by[nth].append(pid)
        # filtered = list(filter(lambda x: x['year'] == row['year'], rows))
        # for p in filtered:
        #     pid = p['id']
        #     if pid not in row['all_dom'] and pid not in row['all_dom_by']:
        #         nth = rows[pid]['nth-skyline']
        #         while (len(conflict) <= nth):
        #             conflict.append([])
        #         conflict[nth].append(pid)
        results.append({'id': id, 'dom': dom, 'dom_by': dom_by})

    # with open('../../static/skyflow/data/processed/NBA_nth')


def layers():
    rows = readJSON('../../static/skyflow/data/processed/NBA_nth.json')
    layers = list()
    for y in range(1978, 2016 + 1):
        layers.append([])
    for row in rows:
        while len(layers[int(row['year']) - 1978]) <= row['nth-skyline']:
            layers[int(row['year']) - 1978].append([])
        layers[int(row['year']) - 1978][row['nth-skyline']].append(row['id'])
    with open('../../static/skyflow/data/processed/NBA_layers.json', 'w') as f:
        f.write(json.dumps(layers))
        f.flush()


def tsne_json():
    file = '../../static/skyflow/data/processed/NBA processed.json'
    output = '../../static/skyflow/data/processed/NBA_tsne.json'
    keys = ['g', 'orb', 'drb', 'trb', 'ast', 'stk', 'blk', 'shot']
    tsne(file, keys, output)


def vector_sum_json():
    file = '../../static/skyflow/data/processed/NBA processed.json'
    output = '../../static/skyflow/data/processed/NBA_vector_sum.json'
    keys = ['g', 'orb', 'drb', 'trb', 'ast', 'stk', 'blk', 'shot']
    vector_sum(file, keys, output)


# def vector_sum(file, keys, output):
def vector_sum(file, keys, output):
    rows = readJSON(file)['data']
    l = list()

    for row in rows:
        l.append([float(row['values'][x]) for x in keys])
    norm_values = get_normalized_data(l)
    print(l)
    print(norm_values)
    vectors = get_vector_sum(norm_values)
    print(vectors)
    for i, row in enumerate(rows):
        row['x'] = vectors[i][0]
        row['y'] = vectors[i][1]

    with open(output, 'w') as f:
        f.write(json.dumps({'data': rows}))
        f.flush()


def vector_sum(file, keys, output):
    rows = readJSON(file)['data']
    l = list()

    for row in rows:
        l.append([float(row['values'][x]) for x in keys])
    norm_values = get_normalized_data(l)
    print(l)
    print(norm_values)
    vectors = get_vector_sum(norm_values)
    print(vectors)
    for i, row in enumerate(rows):
        row['x'] = vectors[i][0]
        row['y'] = vectors[i][1]
        x = vectors[i][0]
        y = vectors[i][1]
        theta = 0
        if x > 0 and y > 0:  # 1사분면
            theta = math.asin(y)
        elif x < 0 and y > 0:  # 2사분면
            theta = math.acos(x)
        elif x < 0 and y < 0:
            theta = -math.asin(y) + math.pi
        elif x > 0 and y < 0:
            theta = 2 * math.pi - math.acos(x)
        else:
            print('error', x, y)
        row['theta'] = theta
        # print(vectors[i][0], vectors[i][1], theta * 180 / math.pi)

    with open(output, 'w') as f:
        f.write(json.dumps({'data': rows}))
        f.flush()


def tsne(file, keys, output):
    rows = readJSON(file)['data']
    l = list()
    for row in rows:
        l.append([row['values'][x] for x in keys])
    x = np.array(l)
    # print(X)
    x_embedded = TSNE(n_components=2).fit_transform(x)
    for i, row in enumerate(x_embedded):
        rows[i]['x'] = float(row[0])
        rows[i]['y'] = float(row[1])

    with open(output, 'w') as f:
        f.write(json.dumps({'data': rows}))
        f.flush()


def yearly_tsne(file, output):
    rows = readJSON(file)
    year_idx = 0
    for year in range(1978, 2016):
        print(year, year_idx)
        l = [list(x['values'].values()) for x in list(filter(lambda x: int(x['year']) == year, rows))]
        x = np.array(l)
        # print(X)
        x_embedded = TSNE(n_components=2).fit_transform(x)
        for i, row in enumerate(x_embedded):
            rows[year_idx + i]['x'] = float(row[0])
            rows[year_idx + i]['y'] = float(row[1])
        year_idx += len(l)
        # print(list(filter(lambda x: x['year'] == year, rows)))
    with open(output, 'w') as f:
        f.write(json.dumps(rows))
        f.flush()
    # with open(output, 'w') as f:
    #     f.write(json.dumps({'data': rows}))
    #     f.flush()


def jsonMerge():
    tsne = readJSON('../data/tsne.json')
    score = readJSON('../data/dominance_score.json')
    skylines = readJSON('../data/skylines.json')
    for i, t in enumerate(tsne):
        t['dominance_count'] = score[i]['values']
    for level, value in enumerate(skylines):
        for idx in value['values']:
            tsne[idx]['level'] = level
            # pprint.pprint(tsne)

    with open('../data/tsne_dominance_level.json', 'w') as f:
        f.write(json.dumps(tsne, indent=4))
        f.flush()


def dict2list(normalized_rows, columns):
    normalized_list = list()
    for row in normalized_rows:
        l = list()
        for c in columns:
            l.append(row[c])
        normalized_list.append(l)
    return normalized_list


def t_SNE(rows, values):
    l = list()
    for row in rows:
        l.append([row[x] for x in values])

    x = np.array(l)
    # print(X)
    x_embedded = TSNE(n_components=2).fit_transform(x)
    jsonlist = list()
    for i, row in enumerate(x_embedded):
        jsondict = dict()
        jsondict['id'] = i
        jsondict['x'] = float(row[0])
        jsondict['y'] = float(row[1])
        jsonlist.append(jsondict)
    return jsonlist


def get_tsne_kvlist(x_embedded):
    jsonlist = list()
    for i, row in enumerate(x_embedded):
        jsondict = dict()
        jsondict['id'] = i
        jsondict['x'] = float(row[0])
        jsondict['y'] = float(row[1])
        jsonlist.append(jsondict)
    return jsonlist


def write_tsne_coordinate(x_embedded, file):
    jsonlist = list()
    for i, row in enumerate(x_embedded):
        jsondict = dict()
        jsondict['id'] = i
        jsondict['x'] = float(row[0])
        jsondict['y'] = float(row[1])
        jsonlist.append(jsondict)
    with open(file, 'w') as f:
        f.write(json.dumps(jsonlist, indent=4))


def readJSON(file):
    with open(file, 'r') as f:
        data = json.load(f)
        return data


def read(file):
    with open(file, 'r') as csvFile:
        reader = csv.DictReader(csvFile)
        rows = list()
        for row in reader:
            rows.append(row)
        return rows


# pick column needed와 겹침
def read_columns(rows, columns):
    result = list()
    for row in rows:
        d = dict()
        for column in columns:
            d[column] = row[column]
        result.append(d)
    return result


def count_name(rows):
    d = dict()

    for row in rows:
        if row['Player ID'] in d:
            d[row['Player ID']].append(row)
        else:
            d[row['Player ID']] = list()
            d[row['Player ID']].append(row)

    print(d)


# 한해에 두번씩 써있는 선수들의 뒤에 값을 없앤다.
def erase_redundancy(rows):
    d = set()
    l = list()

    for i, row in enumerate(rows):
        if (row['Player'], row['Year']) in d:
            l.append(i)
        else:
            d.add((row['Player'], row['Year']))

    for l_i in l[::-1]:
        del (rows[l_i])

    # with open('../data/NBA_redundancy_erased.csv', 'w') as csvfile:
    #     writer = csv.DictWriter(csvfile, fieldnames=rows[0].keys())
    #     writer.writeheader()
    #
    #     for row in rows:
    #         writer.writerow(row)
    return rows


def pick_column_needed(rows, column_needed):
    picks = list()
    for row in rows:
        d = dict()
        for c in column_needed:
            d[c] = row[c]
        picks.append(d)

    # with open('../data/NBA_column_picked.csv', 'w') as csvfile:
    #     writer = csv.DictWriter(csvfile, fieldnames=picks[0].keys())
    #     writer.writeheader()
    #
    #     for row in picks:
    #         writer.writerow(row)
    return picks


# data를 노말라이즈
def get_normalized_data(l):
    nparr = np.array(l)
    npmean = np.mean(l, axis=0)
    npmin = np.min(l, axis=0)
    npstd = np.std(l, axis=0)
    npmax = np.max(l, axis=0)
    # pprint.pprint(npmean)
    # pprint.pprint(npmin)
    # pprint.pprint(npmax)
    # pprint.pprint(npstd)
    norm_values = list()
    for r_i, row in enumerate(l):
        norm_values.append([])
        for i, v in enumerate(row):
            norm_values[r_i].append((v - npmean[i]) / npstd[i])
    return norm_values


def get_vector_sum(norm_values):
    result = list()
    vectors = list()
    for row in norm_values:
        # 6차원
        units = np.array(
            [[1, 0],
             [math.sqrt(2) / 2, math.sqrt(2) / 2],
             [0, 1],
             [-math.sqrt(2) / 2, math.sqrt(2) / 2],
             [-1, 0],
             [-math.sqrt(2) / 2, -math.sqrt(2) / 2],
             [0, -1],
             [math.sqrt(2) / 2, -math.sqrt(2) / 2]
             ])

        for i in range(8):
            units[i] = row[i] * units[i]
        v = np.sum(units, axis=0)
        vectors.append([v[0], v[1]])
    # print(result)
    # unit vector로 만듬
    for i, d in enumerate(vectors):
        vectors[i] = d / np.linalg.norm(d)
    return vectors

    # for row in range(len(data[0])):
    #     for
    # column in data:
    # print(column)
    # print(result)
    pass


def list2jsonfile(rows, filepathname):
    jsonlist = list()
    for i, row in enumerate(rows):
        jsondict = dict()
        jsondict['id'] = i
        jsondict['values'] = row
        jsonlist.append(jsondict)
    with open(filepathname, 'w') as f:
        f.write(json.dumps(jsonlist, indent=4))
        f.flush()


def list2file(rows, filepathname):
    with open(filepathname, 'w') as f:
        for i, row in enumerate(rows):
            f.write('{}'.format(i))
            for v in row:
                f.write(',{}'.format(v))
            f.write('\n')
            f.flush()


def list2file_1elem(rows, filepathname):
    with open(filepathname, 'w') as f:
        for i, v in enumerate(rows):
            f.write('{}'.format(i))
            f.write(',{}'.format(v))
            f.write('\n')
            f.flush()


def write_vector(rows):
    with open('../data/NBA_vectors.csv', 'w') as f:
        f.write('{},{},{},{}\n'.format('id', 'year', 'x', 'y'))
        for row in rows:
            f.write('{},{},{},{}\n'.format(row['Player ID'], row['Year'], row['vectorX'], row['vectorY']))


def find_dominated_by_list(data):
    dominance_list = dict()
    for row in data:
        dominance_list[row[0]] = list()
    for i_d, d in enumerate(data):
        # if A is dominated by B :
        # dominance_list[A].append(B)
        for i_j, j in enumerate(data):
            # skyline 여러 차원 중에서 한차원이라도 커야함
            if any([True if a > b else False for a, b in zip(d, j)]) and \
                    all([True if a >= b else False for a, b in zip(d, j)]):
                dominance_list[j[0]].append(d[0])
    # print(dominance_list)
    # for i, d in enumerate(dominance_list):
    #     print(i, d)
    return dominance_list


def mask(df, key, val):
    return df[df[key] >= val]


def selected_skyline(selected_idx):
    opt = 0
    if opt == 0:  # NBA
        # data = list()
        data = pd.read_csv('../../static/skyflow/data/original/nba-players-stats/filtered_tsne.csv', sep=',')
        # with open('../../static/skyflow/data/original/nba-players-stats/filtered_tsne.csv', 'r') as f:
        #     csvReader = csv.reader(f, delimiter=',')
        #     for r in csvReader:
        #         data.append(r)
        # print(data.keys())
        start_idx = 5
        selected_columns = list(map(lambda x: data.columns[x + start_idx], selected_idx))
        # print(data.dtypes)
        print(selected_columns)
        # print(filtered_data)
        year_data = list()
        dominance_dict = dict()
        pd.DataFrame.mask = mask
        for i in range(data.shape[0]):
            dominance_dict[i] = [[], []]
        for year in range(1980, 2017):
            print(year)
            year_data = data[data.Year == year]
            print(year_data.shape[0])
            filtered_data = year_data[['id', ] + selected_columns]
            # print(filtered_data)

            # print(filtered_data.shape[0])
            # print(list(range(filtered_data.shape[0] - 1)))
            iter = 0

            for idx_a in range(filtered_data.shape[0]):
                cmp = list()
                for column in selected_columns[2:]:
                    cmp.append(year_data.iloc[idx_a][column])
                for i, column in enumerate(selected_columns[2:]):
                    answer = year_data.mask(column, cmp[i])
                dominance_dict[idx_a] = answer
                # print(answer)

            # for idx_a in range(filtered_data.shape[0] - 1):  # 마지막꺼 빼고 진행된다
            #     # print(idx, row)
            #     # fd_slice = filtered_data.ix[idx_a + 1:]
            #
            #     for idx_b in range(idx_a + 1, filtered_data.shape[0]):
            #         iter += 1
            #         # print(idx_a, idx_b)
            #         row_a = filtered_data.iloc[idx_a]
            #         row_b = filtered_data.iloc[idx_b]
            #         # print(row_a['id'], row_b['id'])
            #         if all([True if a >= b else False for a, b in zip(row_a[2:], row_b[2:])]):
            #             # if a dominate b
            #             dominance_dict[idx_a][0].append(row_b['id'])
            #             dominance_dict[idx_b][1].append(row_a['id'])
            #             test = list(zip(row_a[2:], row_b[2:]))
            #             # print(row_a['id'], row_b['id'], test)
            #         elif all([True if b >= a else False for a, b in zip(row_a[2:], row_b[2:])]):
            #             # elif any([True if b > a else False for a, b in zip(row_a[2:], row_b[2:])]) and all(
            #             #         [True if b >= a else False for a, b in zip(row_a[2:], row_b[2:])]):
            #             # if b dominate a
            #             dominance_dict[idx_b][0].append(row_a['id'])
            #             dominance_dict[idx_a][1].append(row_b['id'])
            # print(iter, dominance_dict)
            # print(year, dominance_list)
        # columns = data[0]

        # print(columns)

        # total = dict()
        # for i, year in enumerate(range(1980, 2017)):
        #     for d_i, d in enumerate(year_data):
        #         dominance_list = list()
        #         dominance_by_list = list()
        #         # dominance_list[A].append(B)
        #         for j_i, j in enumerate(year_data[i]):
        #             # skyline 여러 차원 중에서 한차원이라도 커야함
        #             if any([True if a > b else False for a, b in zip(d[2:], j[2:])]) and \
        #                     all([True if a >= b else False for a, b in zip(d[2:], j[2:])]):
        #                 dominance_list.append(int(j[0]) - 1)
        #
        #             # skyline 여러 차원 중에서 한차원이라도 커야함
        #             elif any([True if a < b else False for a, b in zip(d[2:], j[2:])]) and \
        #                     all([True if a <= b else False for a, b in zip(d[2:], j[2:])]):
        #                 dominance_by_list.append(int(j[0]) - 1)
        #         total[d[0]] = (dominance_list, dominance_by_list)
        # print(total)
        return ''
    else:
        pass


# def find_direct_dominating_list(normalized_rows, start_idx)
def get_domrelation():
    data = list()
    with open('../../static/skyflow/data/original/nba-players-stats/filtered_tsne.csv', 'r') as f:
        csvReader = csv.reader(f, delimiter=',')
        for r in csvReader:
            data.append(r)
    columns = ['0', 'Year', 'G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%']
    columns_idx = [data[0].index(i) for i in columns]

    total = list()
    filtered = list()
    for d in data:
        row = [d[i] for i in columns_idx]
        filtered.append(row)
    print()
    for year in range(1980, 2018):
        year_data = list(filter(lambda x: int(x[1]) == year, filtered[1:]))
        for d_i, d in enumerate(year_data):
            # if A is dominated by B :
            dominance_list = list()
            dominance_by_list = list()
            # dominance_list[A].append(B)
            for j_i, j in enumerate(year_data):
                # skyline 여러 차원 중에서 한차원이라도 커야함
                if any([True if a > b else False for a, b in zip(d[2:], j[2:])]) and \
                        all([True if a >= b else False for a, b in zip(d[2:], j[2:])]):
                    dominance_list.append(int(j[0]) - 1)
            for j_i, j in enumerate(year_data):
                # skyline 여러 차원 중에서 한차원이라도 커야함
                if any([True if a < b else False for a, b in zip(d[2:], j[2:])]) and \
                        all([True if a <= b else False for a, b in zip(d[2:], j[2:])]):
                    dominance_by_list.append(int(j[0]) - 1)
            total.append((dominance_list, dominance_by_list))
    print()
    jsontotal = list()
    for i, row in enumerate(total):
        jsontotal.append({'id': i, 'dom': row[0], 'dom_by': row[1]})
    with open('../../static/skyflow/data/original/nba-players-stats/dom.json', 'w') as f:
        f.write(json.dumps(jsontotal, indent=4))
        f.flush()


def find_dominating_list(data):
    dominance_list = list()
    dominance_by_list = list()
    for i in range(len(data)):
        dominance_list.append(list())
        dominance_by_list.append(list())
    for d_i, d in enumerate(data):
        # if A is dominated by B :
        # dominance_list[A].append(B)
        for j_i, j in enumerate(data):
            # skyline 여러 차원 중에서 한차원이라도 커야함
            if any([True if a > b else False for a, b in zip(d[1], j[1])]) and \
                    all([True if a >= b else False for a, b in zip(d[1], j[1])]):
                dominance_list[d_i].append(j[0])
                dominance_by_list[j_i].append(d[0])
    # print(dominance_list)
    # for i, d in enumerate(dominance_list):
    #     print(i, d)
    return dominance_list, dominance_by_list


def find_dominate_score(normalized_rows, start_idx):
    dominance_list = dict()
    for row in normalized_rows:
        dominance_list[row[0]] = 0
    for i, d in enumerate(normalized_rows):
        # if A is dominated by B :
        # dominance_list[A].append(B)
        for i_j, j in enumerate(normalized_rows):
            # skyline 여러 차원 중에서 한차원이라도 커야함
            if any([True if a > b else False for a, b in zip(d[start_idx:], j[start_idx:])]) and \
                    all([True if a >= b else False for a, b in zip(d[start_idx:], j[start_idx:])]):
                dominance_list[d[0]] += 1
    return dominance_list


def write_score(rows):
    with open('../data/NBA_score.csv', 'w') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def classify_skylines(normalized_list, start_idx):
    skyline_candidates = [row for row in normalized_list]
    # for i, c in enumerate(skyline_candidates):
    #     c.insert(0, i)
    non_skyline = list()
    # for row in rows:
    skylines = list()
    # skyline이 안된애들이 남아있으면 계속 반복
    level = 0
    while skyline_candidates:
        for i, d in enumerate(skyline_candidates):
            # if A is dominated by B :
            #     dominance_list[A].append(B)
            for i_j, j in enumerate(skyline_candidates):
                # if i == i_j:
                #     continue
                # [zip(d[k], j[k]) for k in keys[4:10]]
                # f = zip(d[keys[4:10]], j[keys[4:10]])
                # skyline 여러 차원 중에서 한차원이라도 커야함
                # if all([True if a <= b else False for a, b in zip(d[start_idx:], j[start_idx:])]):
                if any([True if a > b else False for a, b in zip(d[start_idx:], j[start_idx:])]) and \
                        all([True if a >= b else False for a, b in zip(d[start_idx:], j[start_idx:])]):
                    # d에 의해 j가 도미네이트 되었으므로 j는 non-skyline
                    if j not in non_skyline:
                        non_skyline.append(j[0])
                    break
        candidates = list()
        skylines.append(list())

        if all(True if a[0] in non_skyline else False for a in skyline_candidates):
            for c in skyline_candidates:
                skylines[level].append(c[0])
            return skylines

        for c in skyline_candidates:
            if c[0] in non_skyline:
                candidates.append(c)
            else:
                skylines[level].append(c[0])

        skyline_candidates = candidates
        non_skyline = list()
        level += 1
        print(level)
        # if level > 5:
        #     break
        # keys = list(skyline_candidates[0].keys())
        # keys = sorted(keys)
        # f.write(
        #     '{},{},{},{},{}\n'.format('Player ID', 'Year', 'vectorX',
        #                               'vectorY', 'dominance'))
        # for key in keys:
        #     for item in skyline_candidates:
        #         f.write(
        #             '{},{},{},{},{}\n'.format(item['Player ID'], item['Year'], item['vectorX'],
        #                                       item['vectorY'], item['dominance']))
    return skylines


def set_floor():
    rows = list()
    with open('../data/NBA_score.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    floors = dict()
    for row in rows:
        x = round(float(row['vectorX']), 2)
        y = round(float(row['vectorY']), 2)
        if (x, y) not in floors:
            floors[(x, y)] = list()
        floors[(x, y)].append(row)
    for key in floors.keys():
        if len(floors[key]) > 1:
            print(floors[key])
    print(floors)
    with open('../data/NBA_floor.csv', 'w') as f:
        keys = list(floors.keys())
        keys = sorted(keys)
        f.write(
            '{},{},{},{},{}\n'.format('Player ID', 'Year', 'vectorX',
                                      'vectorY', 'dominance'))
        for key in keys:
            for item in floors[key]:
                f.write(
                    '{},{},{},{},{}\n'.format(item['Player ID'], item['Year'], key[0],
                                              key[1], item['dominance']))


def classify_skyline():
    rows = list()
    with open('../data/NBA_score.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    keys = list(rows[0].keys())
    skyline_candidates = [row for row in rows]
    non_skyline = list()
    # for row in rows:

    # skyline이 안된애들이 남아있으면 계속 반복
    level = 1
    while skyline_candidates:
        for i, d in enumerate(skyline_candidates):
            # if A is dominated by B :
            #     dominance_list[A].append(B)
            for i_j, j in enumerate(skyline_candidates[:i] + skyline_candidates[i + 1:]):
                # [zip(d[k], j[k]) for k in keys[4:10]]
                # f = zip(d[keys[4:10]], j[keys[4:10]])
                # skyline 여러 차원 중에서 한차원이라도 커야함
                alist = [d[k] for k in keys[4:10]]
                blist = [j[k] for k in keys[4:10]]
                if all([True if a <= b else False for a, b in zip(alist, blist)]):
                    # if any([True if a > b else False for a, b in zip(d[1:], j[1:])]) and \
                    #    all([True if a >= b else False for a, b in zip(d[1:], j[1:])]):
                    if d not in non_skyline:
                        non_skyline.append(d)
                    break

        for n in non_skyline:
            skyline_candidates.remove(n)

        with open('../data/skyline/{}_skyline.csv'.format(level), 'w') as f:
            writer = csv.DictWriter(f, fieldnames=skyline_candidates[0].keys())
            writer.writeheader()
            for row in skyline_candidates:
                writer.writerow(row)

        skyline_candidates = non_skyline
        non_skyline = list()
        level += 1
        # keys = list(skyline_candidates[0].keys())
        # keys = sorted(keys)
        # f.write(
        #     '{},{},{},{},{}\n'.format('Player ID', 'Year', 'vectorX',
        #                               'vectorY', 'dominance'))
        # for key in keys:
        #     for item in skyline_candidates:
        #         f.write(
        #             '{},{},{},{},{}\n'.format(item['Player ID'], item['Year'], item['vectorX'],
        #                                       item['vectorY'], item['dominance']))
    return


def write_csv(path, rows):
    with open(path, 'w') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()

        for row in rows:
            writer.writerow(row)


def txt2csv():
    dl = list()

    with open('../data/inv_2_int.txt', 'r') as f:
        lines = f.readlines()
        for line in lines:
            arr = line.strip().split(' ')
            d = dict()
            for i, _ in enumerate(arr):
                d[i] = arr[i]
            dl.append(d)

    write_csv('../data/inv_2_int.csv', dl)


def non_normalized_vectorsum():
    pass


def get_vector_minmax(rows):
    xs = [float(row['vectorX']) for row in rows]
    ys = [float(row['vectorY']) for row in rows]
    print(min(xs), max(xs))
    print(min(ys), max(ys))
    pass


def modify_realskyline2zero():
    rows = readJSON('../../static/skyflow/data/processed/NBA_vector_sum.json')['data']
    for row in rows:
        if len(row['dominated_by']) == 0:
            print(row)
            row['nth-skyline'] = 0

    with open('../../static/skyflow/data/processed/NBA_vector_sum_modified.json', 'w') as f:
        f.write(json.dumps({'data': rows}))
        f.flush()


def delete_redundant_skyline():
    rows = readJSON('../../static/skyflow/data/processed/NBA_vector_sum_modified.json')['data']
    for row in rows:
        erase_list = list()
        for dom_id in row['dominating']:
            l = [True if dom_id in rows[d]['dominating'] else False for d in row['dominating']]
            if any(l):
                erase_list.append(dom_id)
        for i in erase_list:
            row['dominating'].remove(i)

    with open('../../static/skyflow/data/processed/NBA_vector_sum_redundant_erased.json', 'w') as f:
        f.write(json.dumps({'data': rows}))
        f.flush()


def tsne_csv():
    lines = list()
    data = list()
    with open('../../static/skyflow/data/original/nba-players-stats/filtered.csv', 'r') as f:
        csvReader = csv.reader(f, delimiter=',')
        idx = 0
        for i, row in enumerate(csvReader):
            if i > 0 and int(row[2]) < 1980:
                continue
            row[0] = idx
            idx += 1
            lines.append(row)
            data.append(row[7:])
    print(lines[0])

    l = list()
    for line_i, da in enumerate(data[1:]):
        for i, d in enumerate(da):
            if d == '':
                da[i] = 0
                lines[line_i + 1][i + 7] = 0
            else:
                try:
                    da[i] = float(d)
                    lines[line_i + 1][i + 7] = float(d)
                except ValueError as e:
                    print(e.args)

    x = np.array(data[1:])
    # x = x.astype(np.float)
    # print(X)
    x = np.asfarray(x, float)
    lines[0].insert(7, 'tsne_x')
    lines[0].insert(8, 'tsne_y')
    x_embedded = TSNE(n_components=2).fit_transform(x)
    for i, row in enumerate(x_embedded):
        lines[i + 1][0] = int(lines[i + 1][0]) - 1
        lines[i + 1].insert(7, round(float(row[0]), 3))
        lines[i + 1].insert(8, round(float(row[1]), 3))

    with open('../../static/skyflow/data/original/nba-players-stats/filtered_tsne.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerows(lines)


def baseball_redundant():
    data = pd.read_csv('../../static/skyflow/data/processed/baseball.csv')
    print(data)
    dropped = data.drop_duplicates(['playerID', 'yearID', 'POS'])

    dropped = dropped.reset_index()

    dropped = dropped.drop(
        columns=['index', 'Unnamed: 0', 'PB', 'stint'])
    print(dropped)
    columns = list(dropped.columns)

    info = dropped.info()
    # l = [(dropped.columns[i], dropped.dtypes[i].name) for i in range(dropped.shape[1])]
    # # for i in range(dropped.shape[1]):
    # #     dropped
    # # print(sort_list)
    # sorted_list = sorted(l, key=itemgetter(0), reverse=True)
    # sorted_list = sorted(sorted_list, key=itemgetter(1), reverse=True)
    # print(sorted_list)
    # sorted_columns = [x[0] for x in sorted_list]
    # print(sorted_columns)
    print(columns)

    idx = columns.index('salary')
    del (columns[idx])
    idx = columns.index('POS')
    del (columns[idx])
    idx = columns.index('yearID')
    del (columns[idx])
    columns.insert(1, 'POS')
    columns.insert(2, 'salary')
    columns.insert(0, 'yearID')


    # shows how many nan values in each column?
    for c in dropped.columns:
        print(c, dropped[c].isna().sum())
    dropped = dropped[columns]
    dropped = dropped.rename(columns={'yearID': 'Year'})
    print(dropped)
    dropped.to_csv('../../static/skyflow/data/processed/baseball_redundant.csv', mode='w')

def nba_setting():
    data = pd.read_csv('../../static/skyflow/data/original/NBA Season Data.csv')
    print(data)
if __name__ == '__main__':
    # rows = read('../data/NBA_redundancy_erased.csv')
    # column_needed = ['Year', 'Player', 'Player ID', 'Tm', 'ORB%', 'DRB%', 'AST%', 'STL%', 'BLK%', 'Shot%']
    # count_name(rows)
    # erase_redundancy(rows)
    # pick_column_needed(rows, column_needed)
    # picked_rows = read('../data/NBA_column_picked.csv')
    # normalized_rows = get_normalized_data(picked_rows)
    # vector_sum = get_vector_sum(normalized_rows)
    # write_vector(vector_sum)
    #
    # dom_score = dominate_score(vector_sum)
    # write_score(dom_score)
    # print(dom_score)
    # set_floor()
    # classify_skyline()
    # interpolation()
    # spl_interpolation()
    # txt2csv()
    # get_vector_minmax(read('../data/skyline_spread.csv'))  # x: -3.73~6.215, y: -3.73~4.51
    # classify_skyline()
    # pipeline()
    # tsne_json()
    # vector_sum_json()
    # modify_realskyline2zero()
    # delete_redundant_skyline()
    # jsonMerge()
    # nth_skyline()
    # compareline_id()
    # layers()
    # yearly_tsne('../../static/skyflow/data/processed/NBA_nth.json',
    #             '../../static/skyflow/data/processed/NBA_tsne.json')
    # absent_list()
    # tsne_csv()
    # get_domrelation()
    # selected_skyline([1, 4, 6, 7])
    # baseball_redundant()
    nba_setting()
