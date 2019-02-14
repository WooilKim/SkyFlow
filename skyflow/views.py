from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse


# from skyflow.preprocess.NBA.dominance import selected_skyline

# Create your views here.

# def index(request):
#     # template = loader.get_template('skyflow/index.html')
#     context = {
#
#     }
#     return render(request, 'skyflow/index.html', context)

#
# def relation(request):
#     # template = loader.get_template('skyflow/index.html')
#     context = {
#
#     }
#     return render(request, 'skyflow/detail.html', context)
#
#
# def projection(request):
#     # template = loader.get_template('skyflow/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'skyflow/projection.html', context)
#
#
# def project_plain(request):
#     # template = loader.get_template('skyflow/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'skyflow/project_plain.html', context)
#
#
# def compare(request):
#     # template = loader.get_template('skyflow/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'skyflow/compare.html', context)
#
#
# def bundling(request):
#     # template = loader.get_template('skyflow/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'skyflow/bundling.html', context)
#
#
# def mapbox(request):
#     # template = loader.get_template('skyflow/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'skyflow/mapbox.html', context)
#

def glyph(request):
    context = {}
    return render(request, 'skyflow/glyph.html', context)


def index(request, question_id):
    # template = loader.get_template('skyflow/index.html')
    # years = [1978 + i for i in range(39)]

    context = {
        'qid': question_id
    }
    return render(request, 'skyflow/skyx.html', context)


def lineup(request, question_id):
    # template = loader.get_template('skyflow/index.html')
    context = dict()
    context['qid'] = question_id
    # if question_id == 6:
    #     context = {
    #         'columns': ["2P", "PTS", "AST", "STL", "PER"]
    #     }
    # elif question_id == 7:
    #     context = {
    #         'columns': ["2P", "PTS", "AST", "STL"]
    #     }
    # elif question_id == 8:
    #     context = {
    #         'columns': ["BLK", "ORB", "DRB", "TRB", "ORB%"]
    #     }
    # elif question_id == 9:
    #     context = {
    #         'columns': ["AST%", "STL%", "BLK%", "FG"]
    #     }
    # elif question_id == 10:
    #     context = {
    #         'columns': ["G", "PTS", "TRB", "AST", "Salary"]
    #     }
    # else:
    #     context = {
    #         'columns': ["Salary", "2P", "PTS", "AST", "STL", "PER", "G", "FG", "BLK", "ORB", "DRB", "TRB", "ORB%",
    #                     "DRB%", "TRB%", "AST%", "STL%", "BLK%", "FG%", "3P%", "PF", "PTS"]
    #     }
    return render(request, 'skyflow/lineup.html', context)

#
# def calculate(request):
#     print('calculate');
#     data = request.META['HTTP_SELECTED'].split(',')
#     data = list(map(int,data))
#     print(data)
#
#     selected_skyline(data)
#     return JsonResponse({'foo': 'bar'})
