from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
# from DOMeasure.preprocess.NBA.dominance import selected_skyline

# Create your views here.

# def index(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     context = {
#
#     }
#     return render(request, 'DOMeasure/index.html', context)

#
# def relation(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     context = {
#
#     }
#     return render(request, 'DOMeasure/detail.html', context)
#
#
# def projection(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'DOMeasure/projection.html', context)
#
#
# def project_plain(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'DOMeasure/project_plain.html', context)
#
#
# def compare(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'DOMeasure/compare.html', context)
#
#
# def bundling(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'DOMeasure/bundling.html', context)
#
#
# def mapbox(request):
#     # template = loader.get_template('DOMeasure/index.html')
#     years = [1978 + i for i in range(39)]
#
#     context = {
#         'years': years
#     }
#     return render(request, 'DOMeasure/mapbox.html', context)
#

def index(request):
    # template = loader.get_template('DOMeasure/index.html')
    years = [1978 + i for i in range(39)]

    context = {
        'years': years
    }
    return render(request, 'skyflow/skyx.html', context)

#
# def calculate(request):
#     print('calculate');
#     data = request.META['HTTP_SELECTED'].split(',')
#     data = list(map(int,data))
#     print(data)
#
#     selected_skyline(data)
#     return JsonResponse({'foo': 'bar'})
