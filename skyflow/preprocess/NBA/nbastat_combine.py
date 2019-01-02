import csv


def combine():
    player_data = list()
    players = list()
    seasons_stats = list()
    with open('../../static/skyflow/data/original/nba-players-stats/player_data.csv', 'r') as f:
        csvReader = csv.reader(f, delimiter=',')
        for r in csvReader:
            player_data.append(r)

        print(player_data)

    with open('../../static/skyflow/data/original/nba-players-stats/players.csv', 'r') as f:
        csvReader = csv.reader(f, delimiter=',')
        for r in csvReader:
            players.append(r)

        print(players)

    with open('../../static/skyflow/data/original/nba-players-stats/seasons_stats.csv', 'r') as f:
        csvReader = csv.reader(f, delimiter=',')
        for r in csvReader:
            seasons_stats.append(r)

        print(seasons_stats)
    # age = dict()
    # for p in seasons_stats[1:]:
    #     if p[1] == '':
    #         continue
    #     if p[4] == '':
    #         continue
    #     if p[2] not in age:
    #         age[p[2]] = set()
    #     age[p[2]].add((int(p[1]) - int(p[4])))
    # for a in age.keys():
    #     if len(age[a]) > 1:
    #         print(a, age[a])
    checkdict = dict()
    for p in seasons_stats[1:]:
        if p[1] == '':
            continue
        if p[4] == '':
            continue
        checkdict[(p[2], p[1])] = p[0]

    # print(age)
    filtered = list()
    filtered.append(seasons_stats[0])
    for v in checkdict.values():
        filtered.append(seasons_stats[int(v) + 1])

    for i, f in enumerate(filtered):
        f[0] = i
        if i == 0:
            f.insert(1, 'nameid')
            continue
        nameid = '{}{}'.format(f[2].lower().replace(' ', ''), int(f[1]) - int(f[4]))
        f.insert(1, nameid)
    with open('../../static/skyflow/data/original/nba-players-stats/filtered.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerows(filtered)


if __name__ == '__main__':
    combine()
