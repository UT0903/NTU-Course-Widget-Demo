import React, { useState, useEffect } from 'react';
import "../container/SearchCourse.css"
import { Pie } from '@ant-design/charts';
import { Space, Tabs } from 'antd';

const { TabPane } = Tabs;

const PieChart = ({ setActiveTab, courses }) => {

    const handleTabChange = key => {
        const [semester, id] = key.split(' ');
        setActiveTab({
            semester,
            id,
        })
    }

    const tidyUpGrade = grade => {
        let readyGrade = []
        for (const [key, value] of Object.entries(grade)) {
            const item = {
                type: key,
                value
            }
            readyGrade.push(item);
        }
        return readyGrade;
    }

    const config = {
        appendPadding: 10,
        width: 500,
        height: 500,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        legend: false,
        label: {
        type: 'outer',
        content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };
    return (
        <>
            <Tabs 
                defaultActiveKey="0" 
                tabPosition="left" 
                className="Search-tab" 
                onChange={key => handleTabChange(key)}
            >
                {courses.map(course => (
                <TabPane
                    tab={`${course.semester} ${course.class_name}`} 
                    key={`${course.semester} ${course.id}`}
                >
                    <Pie {...config} data={tidyUpGrade(course.grade)} className="Search-pie"/>
                </TabPane>
                ))}
            </Tabs>
        </>
    );
};

export default PieChart;
