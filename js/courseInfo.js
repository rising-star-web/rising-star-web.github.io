let isSandiego = false;
let isSeattle = false;

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://backend4.sharemyworks.com/api/Course/";
  //const apiUrl = "http://localhost:3000/api/Course/";
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course_id");
  if (!courseId) {
    console.error("Course ID is missing");
    return;
  }
  const accountId = params.get("accountId") || "";

  const organizationId = params.get("organizationId");
  isSandiego = organizationId == "66bf6a0dcdae5300148e3a2c" || organizationId == "6713eacd00dcfc85b65c206a";
  // Detect Seattle based on organizationId
  isSeattle = organizationId == "6684406b10707d0014fb7369" || organizationId == "67ae3ed6b172e100156401d5" || organizationId == "67e0298d64033c0015ce31bb";

    // Check for 1v1 private class special case
    if (courseId === "1v1" && isSandiego) {
      // Handle 1v1 private class directly without API call
      const privateClassDetails = {
        name: "1v1 private class",
        instructor: null,
        dateStart: new Date().toISOString(),  // Current date as start
        dateEnd: new Date().toISOString(),    // Current date as end
        price: "TBD",
        totalClasses: "TBD",
        organizationId: organizationId
      };
      updatePageContent(privateClassDetails, courseId, accountId);
    } else {
      // Call fetchCourseDetails for all other cases
      fetchCourseDetails(apiUrl, courseId, accountId);
    }

  // Call fetchCourseDetails with all necessary parameters
  fetchCourseDetails(apiUrl, courseId, accountId);
});

function fetchCourseDetails(apiUrl, courseId, accountId) {
  // Build the request URL and include necessary filters
  const url = `${apiUrl}${courseId}?filter=${encodeURIComponent(
    JSON.stringify({ include: ["instructor", "classDays", "coursesDB"] })
  )}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((course) => {
      updatePageContent(course, courseId, accountId);
    })
    .catch((error) => {
      console.error("Failed to fetch course details:", error);
    });
}

function updatePageContent(course, courseId, accountId) {
  function getExtraClassDayTime(classDays) {
    let classDayTimes = [];
    classDays.forEach((classDay) => {
      classDayTimes.push(
        classDay.classDay +
          " " +
          classDay.classTime +
          "-" +
          classDay.classEndTime
      );
    });
    return classDayTimes;
  }
  organizationId = course.organizationId;
  document.getElementById("courseName").innerText = course.name;
  //document.getElementById("courseNameHeader").innerText = course.name;

  // For 1v1 private class, show TBD for course time
  if (courseId === "1v1" && organizationId === "66bf6a0dcdae5300148e3a2c") {
    document.getElementById("courseTime").innerText = "TBD";
    document.getElementById("instructorName").innerText = "TBD";
    document.getElementById("courseDates").innerText = "TBD";
    document.getElementById("coursePrice").innerText = "TBD";
    document.getElementById("totalClasses").innerText = "TBD";
  } else {

    document.getElementById("instructorName").innerText = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`
    : "N/A";

    const courseTimeEl = document.getElementById('courseTime');
    if (organizationId === "6684406b10707d0014fb7369") {
      // Hide the entire row containing course time
      // const courseTimeRow = courseTimeEl.closest('tr');
      // if (courseTimeRow) {
      //   courseTimeRow.style.display = "none";
      // }
    } else {
      const courseTimeRes = getCourseTime(course);
      courseTimeEl.innerText = courseTimeRes;
      // Make sure the row is visible for other organizations
      const courseTimeRow = courseTimeEl.closest('tr');
      if (courseTimeRow) {
        courseTimeRow.style.display = "";
      }
    }
    const courseTimeRes = getCourseTime(course);
    courseTimeEl.innerText = courseTimeRes;
    //document.getElementById("courseTime").innerText = getCourseTime(course);
    document.getElementById("courseDates").innerText =
      course.dateStart.split("T")[0] + " - " + course.dateEnd.split("T")[0];
    document.getElementById("coursePrice").innerText = "$ "+course.price;
    document.getElementById("totalClasses").innerText = course.totalClasses;
  }


  var chinese = window.location.href.includes("cn");
  const queryParams = "courseId=" + courseId +
  "&price=" + course.price +
  "&accountId=" + accountId +
  "&organizationId=" + organizationId;

  // Determine the correct register and login paths based on location
  let registerPath = "/register.html?";
  let loginPath = "/login.html?";

  if (isSandiego) {
    registerPath = "/sandiego/register/?";
    loginPath = "/sandiego/login/?";
  } else if (isSeattle) {
    registerPath = "/seattle/register/?";
    loginPath = "/seattle/login/?";
  }

  const link = (chinese ? "/cn" : "") + registerPath + queryParams;
  const loginLink = (chinese ? "/cn" : "") + loginPath + queryParams;
  document.getElementById("registerLink").href = link;
  document.getElementById("loginLink").href = loginLink;

}

function getCourseTime(course) {
  // Hardcoded time for specific course
  if (course.id === "6905438da66f5c0012793511") {
    return "Wednesday 14:30 - 15:30";
  }

  if (course.organizationId === "65f3061cf9e48a001424996a") {
    return `Monday to Friday ${course.classTime}-${course.classEndTime}`;
  } else {
    const uniqueSchedules = new Set();
    
    // Add the main classDay if it exists
    if (course.classDay && course.classTime && course.classEndTime) {
      uniqueSchedules.add(`${course.classDay} ${course.classTime}-${course.classEndTime}`);
    }
    
    if (course.classDays && Array.isArray(course.classDays)) {
      course.classDays.forEach(day => {
        if (day.classDay && day.classTime && day.classEndTime) {
          uniqueSchedules.add(`${day.classDay} ${day.classTime}-${day.classEndTime}`);
        }
      });
    }
    
    const dayOrder = {
      'Monday': 0,
      'Tuesday': 1,
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4,
      'Saturday': 5,
      'Sunday': 6
    };
    
    // Sort schedules by day of the week
    return Array.from(uniqueSchedules)
      .sort((a, b) => {
        const dayA = a.split(' ')[0];
        const dayB = b.split(' ')[0];
        return dayOrder[dayA] - dayOrder[dayB];
      })
      .join('\n');
  }
}

function getTotalClassesCount(course) {
  let totalClassesCount = 0;
  const startDate = new Date(course.dateStart);
  const endDate = new Date(course.dateEnd);
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  for (
    let day = new Date(startDate);
    day <= endDate;
    day = new Date(day.getTime() + dayMilliseconds)
  ) {
    if (
      course.classDays.some(
        (classDay) => day.getDay() === new Date(classDay.date).getDay()
      )
    ) {
      totalClassesCount++;
    }
  }

  return totalClassesCount;
}
