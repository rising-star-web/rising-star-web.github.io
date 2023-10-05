
var baseUrl = "https://prod-sharemyworks-backend.herokuapp.com/api/Account/getSemesterFeedback"  + new URLSearchParams({
      accountId: '622ae8cc0543c300150170ce',
      courseId: '6462be33803c0f001324f872'});

fetch(baseUrl,
  {
  method: "GET",
  headers: {
    'Authorization': 'Ys6TAGbfIAZymNo6JtHiWZrGvvOGMoDSa4Y4IoIRU1t0YFYEowKjjj7zzoBlEOUi'
  },
});