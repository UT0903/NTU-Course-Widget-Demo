from cool import Cool
from ceiba import Ceiba
def craw(func, acc, pwd):
    ans = func(acc, pwd)
    return [func.__name__, ans]
def main(acc, pwd):
    dic = {"failed":[], "info": []}
    for res in [craw(Cool, acc, pwd), craw(Ceiba, acc, pwd)]:
        if res[1]['status'] == 'success':
            dic["info"] += res[1]['msg']
        else:
            dic["failed"].append(res[0])
    import sys, json
    #dicKeys = dic.keys()
    #while len(str(json.dumps(dic, ensure_ascii=False))) > 8192:
    #    dic.pop(dicKeys[0])
    #    dicKeys = dicKeys[1:]
        
    print(json.dumps(dic, ensure_ascii=False))

if __name__ == '__main__': 
    argv = input().split()
    main(argv[0], argv[1])
