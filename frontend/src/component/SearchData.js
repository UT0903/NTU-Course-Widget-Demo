const searchRequest = {
    keyword: "土"
}

const searchReply = {
    courses: [
        {
            "id":"97008",
            "class_name":"土風舞",
            "class_id":"00250260",
            "class_num":"H9",
            "semester":"109-2",
            "reg_student_num":"199",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"魏豐閔",
            "reg_method":"2",
            "limit_student_num":"44",
        },
        {
            "id":"97011",
            "class_name":"太極劍",
            "class_id":"00250370",
            "class_num":"23",
            "semester":"109-2",
            "reg_student_num":"369",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"游添燈",
            "reg_method":"2",
            "limit_student_num":"50"
        },
        {
            "id":"97010",
            "class_name":"土包子",
            "class_id":"00250260",
            "class_num":"H9",
            "semester":"109-2",
            "reg_student_num":"199",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"魏豐閔",
            "reg_method":"2",
            "limit_student_num":"44",
        },
        {
            "id":"97111",
            "class_name":"土狗兒子",
            "class_id":"00250260",
            "class_num":"H9",
            "semester":"109-2",
            "reg_student_num":"199",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"魏豐閔",
            "reg_method":"2",
            "limit_student_num":"44",
        },
    ]
};

const courseRequest = {
    courses: [
        {
            "id":"97008",
            "class_name":"土風舞",
            "class_id":"00250260",
            "class_num":"H9",
            "semester":"109-2",
            "reg_student_num":"199",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"魏豐閔",
            "reg_method":"2",
            "limit_student_num":"44",
        },
        {
            "id":"97011",
            "class_name":"太極劍",
            "class_id":"00250370",
            "class_num":"23",
            "semester":"109-2",
            "reg_student_num":"369",
            "study_student_num":"52",
            "credit":"1.0",
            "teacher_name":"游添燈",
            "reg_method":"2",
            "limit_student_num":"50"
        },
    ]
}

const courseReply = {
    courses: [
        {
            course: {
                "id":"97008",
                "class_name":"土風舞",
                "class_id":"00250260",
                "class_num":"H9",
                "semester":"109-2",
                "reg_student_num":"199",
                "study_student_num":"52",
                "credit":"1.0",
                "teacher_name":"魏豐閔",
                "reg_method":"2",
                "limit_student_num":"44",
            },
            grade: [
                {
                  type: 'A+',
                  value: 27,
                },
                {
                  type: 'A',
                  value: 25,
                },
                {
                  type: 'A-',
                  value: 18,
                },
                {
                  type: 'B+',
                  value: 15,
                },
                {
                  type: 'B',
                  value: 10,
                },
                {
                  type: '其他',
                  value: 5,
                },
              ]
        },
        {
            course: {
                "id":"97011",
                "class_name":"太極劍",
                "class_id":"00250370",
                "class_num":"23",
                "semester":"109-2",
                "reg_student_num":"369",
                "study_student_num":"52",
                "credit":"1.0",
                "teacher_name":"游添燈",
                "reg_method":"2",
                "limit_student_num":"50"
            },
            grade: [
                {
                  type: 'A+',
                  value: 80,
                },
                {
                  type: '其他',
                  value: 20,
                },
              ]
        },
    ]
}

export { searchReply, courseReply }
