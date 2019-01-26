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

def index(request):
    # template = loader.get_template('skyflow/index.html')
    years = [1978 + i for i in range(39)]

    context = {
        'years': years
    }
    return render(request, 'skyflow/skyx.html', context)


def lineup(request):
    # template = loader.get_template('skyflow/index.html')
    years = [1978 + i for i in range(39)]

    context = {
        'years': years
    }
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
