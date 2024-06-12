document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://backend4.sharemyworks.com/api/Course/";
  //  const apiUrl = "http://localhost:3000/api/Course/";
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course_id");
  const token =
    "k6s6WghHbQ0sFQMw9YTO5MWDCunX3SNAJu8kksejwO0cP1tEh73glea29CGWExEi"; // Secure this properly in production environments

  if (!courseId) {
    console.error("Course ID is missing");
    return;
  }
  const accountId = params.get("accountId") || "";

  var organizationId = "";


  // Call fetchCourseDetails with all necessary parameters
  fetchCourseDetails(apiUrl, courseId, accountId, token);
});

function fetchCourseDetails(apiUrl, courseId, accountId, token) {
  // Build the request URL and include necessary filters
  const url = `${apiUrl}${courseId}?filter=${encodeURIComponent(
    JSON.stringify({ include: ["instructor", "classDays", "coursesDB"] })
  )}`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((course) => {
      updatePageContent(course, courseId, accountId, token);
    })
    .catch((error) => {
      console.error("Failed to fetch course details:", error);
    });
}

function updatePageContent(course, courseId, accountId, token) {
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
  document.getElementById("courseNameHeader").innerText = course.name;

  document.getElementById("instructorName").innerText = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`
    : "N/A";
    const courseTimeEl = document.getElementById('courseTime');
    const courseTimeRes = getCourseTime(course);
    courseTimeEl.innerText = courseTimeRes;
  //document.getElementById("courseTime").innerText = getCourseTime(course);
  document.getElementById("courseDates").innerText =
    course.dateStart.split("T")[0] + " - " + course.dateEnd.split("T")[0];
  document.getElementById("coursePrice").innerText = course.price;
  document.getElementById("totalClasses").innerText = course.totalClasses;
  const link = "/register.html?courseId="+ courseId + "&price=" +course.price + "&accountId=" + accountId + "&token=" + token + "&organizationId=" + organizationId;
  document.getElementById("registerLink").href = link;

}

function getCourseTime(course) {
    const Monday = course.classDay + ' '+ course.classTime + '-' + course.classEndTime;
    const restDays = course.classDays.map((day) => `${day.classDay} ${day.classTime}-${day.classEndTime}`).join("\n ");
  return `${Monday}\n${restDays}`;
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
