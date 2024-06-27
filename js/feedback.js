var competitionMap = {
    'cp520': {
        'id': 'cp520',
        'name': 'Congressional App编程项目竞赛',
        'date': '2023年6月',
    },
    'cp510': {
        'id': 'cp510',
        'name': 'IgniteCS Expo编程项目展',
        'date': '2023年9月',
    },
    'cp350': {
        'id': 'cp350',
        'name': 'USACO信息学竞赛',
        'date': '2023年12月和2024年1月、2月、3月',
    },
    'cp600': {
        'id': 'cp600',
        'name': 'Diamond Challenge项目竞赛',
        'date': '2024年1月',
    },
    'cp500': {
        'id': 'cp500',
        'name': 'Conrad Challenge项目竞赛',
        'date': '2024年1月',
    },
    'cp610': {
        'id': 'cp610',
        'name': 'Ignite Fellowship奖学金项目',
        'date': '2024年1月',
    },

    'cp300': {
        'id': 'cp300',
        'name': 'Microsoft ImagineCup竞赛',
        'date': '2024年5月',
    },
    'cp200': {
        'id': 'cp200',
        'name': 'Apple Challenge项目竞赛',
        'date': '2024年4月',
    },
    'cp400': {
        'id': 'cp400',
        'name': 'Coolest Projects项目竞赛',
        'date': '2024年4月',
    },
};
var competitionMapEng = {
    'cp520': {
        'id': 'cp520',
        'name': 'Congressional App Challenge',
        'date': 'June 2023',
    },
    'cp510': {
        'id': 'cp510',
        'name': 'IgniteCS Expo',
        'date': 'September 2023',
    },
    'cp350': {
        'id': 'cp350',
        'name': 'USACO',
        'date': 'December 2023 and January, February, March 2024',
    },
    'cp600': {
        'id': 'cp600',
        'name': 'Diamond Challenge',
        'date': 'January 2024',
    },
    'cp500': {
        'id': 'cp500',
        'name': 'Conrad Challenge',
        'date': 'January 2024',
    },
    'cp610': {
        'id': 'cp610',
        'name': 'Ignite Fellowship',
        'date': 'January 2024',
    },

    'cp300': {
        'id': 'cp300',
        'name': 'Microsoft ImagineCup',
        'date': 'May 2024',
    },
    'cp200': {
        'id': 'cp200',
        'name': 'Apple Challenge',
        'date': 'April 2024',
    },
    'cp400': {
        'id': 'cp400',
        'name': 'Coolest Projects',
        'date': 'April 2024',
    },
};
document.addEventListener("DOMContentLoaded", function () {
    // Parse URL parameters
    const url = new URL(window.location.href);
    const studentId = url.searchParams.get("studentId");
    const courseId = url.searchParams.get("courseId");
    var chinese = window.location.href.includes("cn");
    var feedbackId;
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

    async function fetchCourseDetails() {
        try {
            const response = await fetch(`https://backend4.sharemyworks.com/api/Account/getSemesterFeedback?accountId=${studentId}&courseId=${courseId}`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            displayCourseDetails(data);
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
        }
    }

    function displayCourseDetails(data) {
        const { course, profile, suggestedCourses } = data;
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
        if (course.feedbacks.length > 0) {
            const length = course.feedbacks.length;
            feedback = chinese ? course.feedbacks[length - 1].text_cn : course.feedbacks[length - 1].text;
            feedbackId = course.feedbacks[length - 1].id;
        }
        //console.log('feedback: ', feedbackId);
        document.getElementById("instructorComments").textContent = feedback;


        if (suggestedCourses && suggestedCourses.length > 0) {
            const suggestion = suggestedCourses[0];
            document.getElementById("courseTitle2").textContent = chinese ? suggestion.shortName : suggestion.sname;
            document.getElementById("courseLevel2").textContent = chinese ? suggestion.gradeLevel : suggestion.gradeLevelEng;
            document.getElementById("courseObjective").textContent = chinese ? suggestion.introduction : suggestion.instructorDescription;
            document.getElementById("classTime2").textContent = chinese ? '我们尽可能保持现有上课时间，如果需要调整请联系我们' : 'We will try to keep the current class time as much as possible. If you need adjustment, please contact us';

        }
        let progress = chinese ? '以下为 ' + profile.firstName + ' 在5级进阶课程体系的学习进度: ' : 'Below is ' + profile.firstName + '\'s progress in the 5-level advanced course system: ';
        document.getElementById("progress").textContent = progress;
    }
    fetchCourseDetails();
    //console.log('feedbackId: ', feedbackId);
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
    const feedbackForm = document.getElementById("feedbackForm");
    feedbackForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const feedbackText = document.getElementById("comment").value;
        try {
            await submitFeedback(feedbackText);
            //console.log('feedback submitted: ', feedbackText);
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
    async function submitFeedback(feedbackText) {
        const response = await fetch('https://backend4.sharemyworks.com/api/NotificationLog/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reply: feedbackText
            })
        });
        if (!response.ok) throw new Error('Failed to submit feedback');
        return response.json();
    }

    // async function getLogId(feedbackId) {
    //     const url = `https://backend4.sharemyworks.com/api/Feedback/${feedbackId}/logs`;
    //     const response = await fetch(url, {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': '7e07BdkkBdGroThWLTF0PrdJhqYVjT3DB7SGkgP5z3eVIloodHjpJDxFP6VAlFZB',
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     if (!response.ok) {
    //         throw new Error('Failed to retrieve logs');
    //     }

    //     const logs = await response.json();
    //     if (logs.length > 0) {
    //         console.log('logs inside getLogId: ', logs);
    //         return logs[0].id; // Return the first log's ID
    //     } else {
    //         throw new Error('No logs available');
    //     }
    // }
    // getLogId(feedbackId).then(logId => {
    //     console.log('logId: ', logId);
    // }).catch(error => {
    //     console.error(error);
    // });




    // async function submitFeedback(logId, replyText, feedbackId, studentRecord, EOSfeedbackText) {
    //     console.log('logId: ', logId);
    //     console.log('replyText: ', replyText);
    //     console.log('feedbackId: ', feedbackId);
    //     console.log('studentRecord: ', studentRecord);
    //     console.log('EOSfeedbackText: ', EOSfeedbackText);

    //     try {
    //         // Submitting the initial feedback reply
    //         let response = await fetch('https://backend4.sharemyworks.com/api/NotificationLog/reply', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': 'Your_Authorization_Token_If_Needed'
    //             },
    //             body: JSON.stringify({
    //                 logId: logId,
    //                 reply: replyText
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to submit feedback');
    //         }

    //         displayToast('success', 'Feedback submitted successfully!');

    //         // Checking response status for additional actions
    //         if (response.status === 204) {
    //             const ManagerEmail = '';
    //             const ManagerNumber = '';
    //             const notifyUrl = `https://backend4.sharemyworks.com/api/Feedback/${feedbackId}/notifyReply`;

    //             response = await fetch(notifyUrl, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': 'Your_Authorization_Token'
    //                 },
    //                 body: JSON.stringify({
    //                     email: ManagerEmail,
    //                     number: ManagerNumber,
    //                     name: `${studentRecord.firstName} ${studentRecord.lastName}`,
    //                     replytext: replyText,
    //                     feedbacktext: EOSfeedbackText,
    //                 })
    //             });

    //             if (!response.ok) {
    //                 throw new Error('Failed to notify manager');
    //             }

    //             console.log('Manager notified successfully.');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         displayToast('error', error.message);
    //     }
    // }

});
