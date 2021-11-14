import csv, sys
def read_csv(file):
    with open(file, newline='') as csvfile:
        rows = csv.DictReader(csvfile, delimiter=';')
        return list(rows)

def nol():
    dic = {}
    for semester in ['109-2', '109-1', '108-2', '108-1', '107-2', '107-1', '106-2', '106-1', '105-2', '105-1']:
        rows = read_csv('craw_files/{}nol.txt'.format(semester))
        #print(rows)
        rows = list(filter(lambda x: x['流水號'] != "", rows))
        for row in rows:
            if (row['流水號'], semester) not in dic:
                dic[(row['流水號'], semester)] = row
    return dic
def add_col(dic):
    with open('craw_files/classesInfo.txt', "r") as f:
        lines = f.readlines()
        for line in lines[1:]:
            line = line.split(";")
            keys = (line[0], '109-2')
            if keys not in dic:
                print('classInfo', line)
                sys.exit(0)
            else:
                dic[keys]['登記人數'] = int(line[-2]) + int(line[-4])
    rows = read_csv('craw_files/output.txt')
    for row in rows:
        keys = (row['流水號'], '109-2')
        if keys not in dic:
            print('output', row)
        else:
            dic[keys]['選上人數'] = row['已選上人數']
    return dic
def choose_field(dic):
    def get_field(obj, field):
        return obj[field] if field in obj else ""
    out = []
    #       流水號,  課程名稱     , 課程識別碼,   班次,       , 學年/學期,   初選登記人數,        最後選上人數,          學分數    授課教師        加選方式,         限制人數    
    title = ['id', 'class_name', 'class_id', 'class_num', 'semester', 'reg_student_num', 'study_student_num', 'credit', 'teacher_name', 'reg_method', 'limit_student_num']
    out.append(title)
    for key, val in dic.items():
        row = [
            get_field(val, "流水號").replace(" ", ""),
            get_field(val, "課程名稱查看課程大綱，請點選課程名稱").replace(" ", ""),
            get_field(val, "課程識別碼").replace(" ", ""),
            get_field(val, "班次").replace(" ", ""),
            key[-1],
            str(get_field(val, "登記人數")).replace(" ", ""),
            get_field(val, "選上人數").replace(" ", ""),
            get_field(val, "學分").replace(" ", ""),
            get_field(val, "授課教師").replace(" ", ""),
            get_field(val, "加選方式").replace(" ", ""),
            get_field(val, "總人數").replace(" ", ""),
        ]
        out.append(row)
    return out       
def write_out(rows):
    with open('craw_files/merged.txt', "w+") as f:
        for row in rows:
            print("\t".join(list(map(str, row))), file=f)
dic = nol()
dic = add_col(dic)
dic = choose_field(dic)
write_out(dic)        