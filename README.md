# Coding Mind 

### Template Documentation
You can reach the documentation as follows:
- **Offline:** docs/index.html
- **Online:** https://sandbox.elemisthemes.com/docs/index.html

### Getting Started
- Install jekyll: https://jekyllrb.com/docs/ 
- Run command: bundle exec jekyll serve

## Documentation
#### Collections: 
Contains markdown files that affect the content of the website, similar to JSON
| Folder  | Location |
| ------------- | ------------- | 
|  _careers |  https://codingmind.com/careers | 
| _courses | https://codingmind.com/courses |
| _projects | https://codingmind.com/projects |
| _reviews | Reviews throughout the website|
|_showcases | HomePage: "The Pursuit of Excellence" |

#### Includes: 
_includes contains reusable components reused throughout the website
- Example Usage: {% include course.html %}  This automatically uses content found in course.html located at the includes folder 
- Further Usage:             
  ```
  {%- assign courses = site.courses %} // Set a liquid variable courses to a collection: courses
  {% for course in courses %} // Loop over collection 
  <div class="swiper-slide">
    {% include course.html %} // Use include to automatically put the courses in the course layout
  </div>
  {% endunless %}
  {% endfor %}
  ```
 - For more information visit: https://jekyllrb.com/docs/liquid/
 
| File  | Usage |
| ------------- | ------------- | 
|career.html | used for career card layout |
|course.html | used for course item layout |
|footer.html | used for footer layout |
|navbar.html | used for navbar layout |
|privacypolicy.html | used for privacy policy content found in the footer |
|project.html | used for project card layout |
|projectslide.html | used for recommended projects layout in project details page |
|review.html | used for reviews in homepage |
|showcase.html | used for showcases in homepage |
|termsandconditions.html | used for terms and conditions content found in the footer |

#### Layouts: 
_layouts folder contains the _default page which wraps every web page, and all the layouts used for detail pages for the collections.
- _default usage: When making a new site page, format the beginning as such: 
  - This will add the navbar and footer content to the page, as well as all the scripts and stylesheets.
  ```
  ---
  layout: default
  ---
  ```
    
- other layouts usage: Inside each collection item in a collections folder contains a field like in the example below:
   - This will set the details page layout for the specific collection item.
  ```
  layout: career_detail
  ```

| File  | Usage |
| ------------- | ------------- | 
|career_detail.html  | used for career card details pages |
|course_detail.html  | used for course details pages |
|default.html  | used wrapping around |
|student_project_detail.html | used for student projects details pages |

#### Scripts:
- Located in assets/js/:
- theme.js line 758: All free trial submissions will be submitted to this google form: https://docs.google.com/forms/d/e/1FAIpQLSccHA0yK51cQHtkRXvtua-tpDDagTTs5YsxZ7Za6l5ZpHlhDw/viewform?usp=sharing
  - These submissions are populated in this google sheets link: https://docs.google.com/spreadsheets/d/10jVKS_PnPKhzd12aEs3gwfXUnjyqStZ7tL6tsqeSL2E/edit?resourcekey#gid=473915124
- Contact Form in contact-us currently uses: https://www.staticforms.xyz/. Request an access key to the designated contact email and replace the access key to make the contact form use another email.

#### Updating Content:
- Run command: bundle exec jekyll serve
- Edit the markdown files in the specific collection folder you want to edit 
- Changes made will be stored in _site folder
- Push changes and the _site folder will be deployed

## 
