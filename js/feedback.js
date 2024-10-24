var competitionMap = {
    'cp520': {
        'id': 'cp520',
        'name': 'Congressional App编程项目竞赛',
        'date': '2024年6月',
    },
    'cp510': {
        'id': 'cp510',
        'name': 'IgniteCS Expo编程项目展',
        'date': '2024年9月',
    },
    'cp350': {
        'id': 'cp350',
        'name': 'USACO信息学竞赛',
        'date': '2024年12月和2025年1月、2月、3月',
    },
    'cp600': {
        'id': 'cp600',
        'name': 'Diamond Challenge项目竞赛',
        'date': '2025年1月',
    },
    'cp500': {
        'id': 'cp500',
        'name': 'Conrad Challenge项目竞赛',
        'date': '2025年1月',
    },
    'cp610': {
        'id': 'cp610',
        'name': 'Ignite Fellowship奖学金项目',
        'date': '2025年1月',
    },

    'cp300': {
        'id': 'cp300',
        'name': 'Microsoft ImagineCup竞赛',
        'date': '2025年5月',
    },
    'cp200': {
        'id': 'cp200',
        'name': 'Apple Challenge项目竞赛',
        'date': '2025年4月',
    },
    'cp400': {
        'id': 'cp400',
        'name': 'Coolest Projects项目竞赛',
        'date': '2025年4月',
    },
};
var competitionMapEng = {
    'cp520': {
        'id': 'cp520',
        'name': 'Congressional App Challenge',
        'date': 'June 2024',
    },
    'cp510': {
        'id': 'cp510',
        'name': 'IgniteCS Expo',
        'date': 'September 2024',
    },
    'cp350': {
        'id': 'cp350',
        'name': 'USACO',
        'date': 'December 2024 and January, February, March 2025',
    },
    'cp600': {
        'id': 'cp600',
        'name': 'Diamond Challenge',
        'date': 'January 2025',
    },
    'cp500': {
        'id': 'cp500',
        'name': 'Conrad Challenge',
        'date': 'January 2025',
    },
    'cp610': {
        'id': 'cp610',
        'name': 'Ignite Fellowship',
        'date': 'January 2025',
    },

    'cp300': {
        'id': 'cp300',
        'name': 'Microsoft ImagineCup',
        'date': 'May 2025',
    },
    'cp200': {
        'id': 'cp200',
        'name': 'Apple Challenge',
        'date': 'April 2025',
    },
    'cp400': {
        'id': 'cp400',
        'name': 'Coolest Projects',
        'date': 'April 2025',
    },
};
const link = new URL(window.location.href);
const chinese = window.location.href.includes("cn");
var studentName = '';
const BASE_URL = 'https://backend4.sharemyworks.com/api/';
// const BASE_URL = 'http://localhost:3000/api/';

document.addEventListener("DOMContentLoaded", function () {
    // Parse URL parameters
    const url = new URL(window.location.href);
    const studentId = url.searchParams.get("studentId");
    const courseId = url.searchParams.get("courseId");
    initializeCompetitions();

    fetchCourseDetails(studentId, courseId).
        then(feedbackId => {
            setupFormListener(feedbackId);
        }).catch(error => {
            console.log('Error fetching course details:', error);
        });
});
async function fetchCourseDetails(studentId, courseId) {
    try {
        const response = await fetch(`${BASE_URL}Account/getSemesterFeedback?accountId=${studentId}&courseId=${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        //displayCourseDetails(data);
        return displayCourseDetails(data);
    } catch (error) {
        console.error("Error fetching course details:", error);
        var message = chinese ? '获取课程详情失败！请重新尝试或者联系管理人员' : 'Failed to get course details! Please try again or contact the administrator.';
        Toastify({
            text: message,
            duration: 5000,
            close: true,
            gravity: "top",
            position: 'right',
            style: {
                background: "red",
            },
            className: "info",
        }).showToast();
        //throw error;
    }
}

function initializeCompetitions() {
    const compListElement = document.getElementById("competitionTable");
    const comTableBody = document.getElementById("comTableBody");
    const competitions = chinese ? Object.values(competitionMap) : Object.values(competitionMapEng);
    competitions.forEach(comp => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = comp.name;
        const td = document.createElement("td");
        td.textContent = comp.date;

        tr.appendChild(th);
        tr.appendChild(td);
        comTableBody.appendChild(tr);

    });
}

function displayCourseDetails(data) {
    const { course, profile, suggestedCourses } = data;
    studentName = profile.firstName + ' ' + profile.lastName;

    document.getElementById("studentName").textContent = profile.firstName + ' ' + profile.lastName;
    document.getElementById("courseTitle").textContent = course.name;
    document.getElementById("courseLevel").textContent = chinese ? course.coursesDB.gradeLevel : course.coursesDB.gradeLevelEng;
    document.getElementById("classTime").textContent = course.classDay + ' ' + course.classTime + ' - ' + course.classEndTime;

    const level = parseInt(course.coursesDB.gradeLevel.charAt(1), 10);
    showLevel(level);

    let summary = course.coursesDB.introduction;
    let summaryEng = course.coursesDB.instructorDescription;

    if (summary) {
        summary = summary.replace(/同学/g, profile.firstName);
    }
    if (summaryEng) {
        summaryEng = summaryEng.replace(/students/g, profile.firstName);
        summaryEng = summaryEng.replace(/student/g, profile.firstName);
    }
    document.getElementById("courseSummary").textContent = chinese ? summary : summaryEng;
    let feedback;
    let feedbackId;
    if (course.feedbacks.length > 0) {
        const length = course.feedbacks.length;
        feedback = chinese ? course.feedbacks[length - 1].text_cn : course.feedbacks[length - 1].text;
        feedbackId = course.feedbacks[length - 1].id;
    }

    //console.log('feedback: inside displayCourseDetails', feedbackId);
    document.getElementById("instructorComments").textContent = feedback;


    if (suggestedCourses && suggestedCourses.length > 0) {
        const suggestion = suggestedCourses[0];
        if (suggestion) {
            if (suggestion.shortName && suggestion.sname) {
                document.getElementById("courseTitle2").textContent = chinese ? suggestion.shortName : suggestion.sname;
            }
            if (suggestion.gradeLevel && suggestion.gradeLevelEng) {
                document.getElementById("courseLevel2").textContent = chinese ? suggestion.gradeLevel : suggestion.gradeLevelEng;
            }
            if (suggestion.introduction && suggestion.instructorDescription) {
                document.getElementById("courseObjective").textContent = chinese ? suggestion.introduction : suggestion.instructorDescription;
            }
            document.getElementById("classTime2").textContent = chinese ? '我们尽可能保持现有上课时间，如果需要调整请联系我们' : 'We will try to keep the current class time as much as possible. If you need adjustment, please contact us';

        } else {
            var message = chinese ? '信息获取失败，请联系我们' : 'Failed to get information, please contact us';
            document.getElementById("courseTitle2").textContent = message;
        }
    } else {
        var message = chinese ? '信息获取失败，请联系我们' : 'Failed to get information, please contact us';
        document.getElementById("courseTitle2").textContent = message;
    }
    let progress = chinese ? '以下为 ' + profile.firstName + ' 在5级进阶课程体系的学习进度: ' : 'Below is ' + profile.firstName + '\'s progress in the 5-level advanced course system: ';
    document.getElementById("progress").textContent = progress;
    return feedbackId;
}
function setupFormListener(feedbackId) {
    const feedbackForm = document.getElementById("feedbackForm");
    feedbackForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const feedbackText = document.getElementById("comment").value;
        try {
            const logId = await getLogId(feedbackId);
            submitFeedback(logId, feedbackId, feedbackText);
            //console.log('feedback submitted: ', feedbackText);
        } catch (error) {
            var message = chinese ? '反馈提交失败！请重新尝试或者联系我们' : 'Feedback submission failed! Please try again or contact us';
            Toastify({
                text: message,
                duration: 5000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "red",
                },
                className: "info",
            }).showToast();

            console.error("Feedback submission failed:", error);
        }
    });

}
function showLevel(level) {
    const colorClasses = ['rosered-gradient', 'orange-gradient', 'forestgreen-gradient', 'navyblue-gradient', 'amethyst-gradient']; // List all possible classes
    const maxLevel = 5;
    const currentLevel = level;
    for (let level = 1; level <= maxLevel; level++) {
        const timelineItem = document.getElementById(`l${level}`);
        const iconSpan = timelineItem.querySelector('.timeline-marker span');
        if (level < currentLevel) {
            timelineItem.classList.add('grayed-out');
            colorClasses.forEach(colorClass => iconSpan.classList.remove(colorClass));
            iconSpan.classList.add('gray-icon');
        }
    }
}

async function getLogId(feedbackId) {
    const response = await fetch(`${BASE_URL}Feedback/${feedbackId}/logs`, {
        method: 'GET',
        headers: {
            'Authorization': '7e07BdkkBdGroThWLTF0PrdJhqYVjT3DB7SGkgP5z3eVIloodHjpJDxFP6VAlFZB',
            'Content-Type': 'application/json'
        }
    });
    const logs = await response.json();
    if (logs.length > 0) {
        return logs[logs.length - 1].id;
    } else {
        throw new Error('No logs available since not notified yet');
    }
}
function submitFeedback(logId, feedbackId, feedbackText) {
    fetch(`${BASE_URL}NotificationLog/reply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            logId: logId,
            reply: feedbackText
        })
    }).then(response => {
        if (!response.ok) {
            console.error('Failed to submit feedback: response not ok !', response);
        }
        if (response.status === 204) {
            notifyManager(feedbackId, feedbackText);
            var message = chinese ? '反馈提交成功！' : 'Feedback submitted successfully!';
            Toastify({
                text: message,
                duration: 5000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "green",
                },
                className: "info",
            }).showToast();
        } else {
            return response.json().then(data => {
                console.log('Feedback submitted');
            });
        }
    }).catch(error => {
        var message = chinese ? '反馈提交失败！请刷新重试或联系我们' : 'Feedback submitted failed! Please refresh and try again or contact us';
            Toastify({
                text: message,
                duration: 5000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "red",
                },
                className: "info",
            }).showToast();
        console.error('Failed to submit feedback:', error);
    });
}
function notifyManager(feedbackId, feedbackText) {
    const notifyUrl = `${BASE_URL}Feedback/${feedbackId}/notifyReply`;
    return fetch(notifyUrl, {
        method: 'POST',
        headers: {
            'Authorization': '7e07BdkkBdGroThWLTF0PrdJhqYVjT3DB7SGkgP5z3eVIloodHjpJDxFP6VAlFZB',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'notification@codingmindsacademy.com',
            number: '(949) 236-7896',
            name: studentName,
            replytext: feedbackText,
            feedbacktext: link
        })
    }).then((response) => {
            if (!response.ok) {
                console.error('Failed to notify manager: response not ok !', response);
                //throw new Error('Failed to notify manager');
            }
            var message = chinese ? '反馈提交成功！' : 'Feedback submitted successfully!';
            Toastify({
                text: message,
                duration: 5000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "green",
                },
                className: "info",
            }).showToast();
            return response.json();
        })
        .catch((error) => {
            console.error('Failed to notify manager:', error);
            //throw new Error('Failed to notify manager');
        });
}

