// Isotope.Item.prototype._create = function() {
//     // assign id, used for original-order sorting
//     this.id = this.layout.itemGUID++;
//     // transition objects
//     this._transn = {
//       ingProperties: {},
//       clean: {},
//       onEnd: {}
//     };
//     this.sortData = {};
//   };
  
//   Isotope.prototype.arrange = function( opts ) {
//     // set any options pass
//     this.option( opts );
//     this._getIsInstant();
//     // just filter
//     this.filteredItems = this._filter( this.items );
//     // flag for initalized
//     this._isLayoutInited = true;
//   };

var itemSelector = ".isotopeItem"; 
var $checkboxes = $('.filter-item');
var $container = $('#isotopeContainer').isotope({ 
    itemSelector: itemSelector,
    percentPosition: true,
    layoutMode: 'fitRows',
});
var $output = $('#output');
var $outputParent = $('#outputParent');

var $containerLength = $('#containerLength');
var iso = $container.data('isotope');

//Ascending order
var itemsPerPage = $('#isotopeContainer').data("length") ;
var currentTotalItems = 0;
var currentNumberPages = 1;
var currentPage = 1;
var currentFilter = '*';
var filterAttribute = 'data-filter';
var filterValue = "";
var pageAttribute = 'data-page';
var pagerClass = 'isotope-pager';

// update items based on current filters    
function changeFilter(selector) { $container.isotope({ filter: selector }); }

//grab all checked filters and goto page on fresh isotope output
function goToPage(n) {
    currentPage = n;
    var inclusives = [];
    var output = [];

    var wordPage = currentPage.toString();
        // for each box checked, add its value and push to array
        $checkboxes.each(function (i, elem) {
            if (elem.checked) {
                inclusives.push('.'+elem.value+'.'+wordPage);
                output.push(elem.value.replace(/([a-z])(\d)/gi, '$1 $2'))
            }
        });

        // smash all values back together for 'and' filtering
        filterValue = inclusives.length ? inclusives.join(',') : '*';
        filterValue += '.' +wordPage;
        outputValue = output.length ? output.join(', ') : '';

    $output.text( outputValue );
        
    if($output.text() == ""){
        $outputParent.hide();
    }
    else{
        $outputParent.css('display', 'inline-block');
    }
    changeFilter(filterValue);
}

function updateFilterCount() {
    var itemText = "";
    var itemsLength = $container.children(itemSelector).length;
    console.log(window.location.pathname);
    if( window.location.pathname == "/courses" || window.location.pathname == "/courses/" || window.location.pathname == "/courses.html" || window.location.pathname == "/courses.html/"){
        if(iso.filteredItems.length>1){
            itemText = " courses";
        }
        else{
            itemText = " course";
        }
        if(currentNumberPages>1){
            itemText += (" out of " + currentTotalItems);
        }
            iso.filteredItems.length ? 
        $containerLength.text( iso.filteredItems.length + itemText)   
        :
        $containerLength.text( "no items" );   
    }
    else{
        if(iso.filteredItems.length>1){
            itemText = iso.filteredItems.length + "门课程";
        }
        else{
            itemText = iso.filteredItems.length + "门课程";
        }
        if(currentNumberPages>1){
            itemText = (currentTotalItems+"门课程"+ "中的") + itemText;
        }
        if(iso.filteredItems.length > 1){
            $containerLength.text( itemText )   
        }
        else{
        $containerLength.text( "未找到任何结果。" );   
        }
    }

  }

function setPagination() {

    var SettingsPagesOnItems = function(){
        var itemsLength = $container.children(itemSelector).length;
        var pages = Math.ceil(itemsLength / itemsPerPage);
        var item = 1;
        var page = 1;
        var inclusives = [];
            // for each box checked, add its value and push to array
            $checkboxes.each(function (i, elem) {
                if (elem.checked) {
                    inclusives.push('.'+elem.value);
                }
            });
            // smash all values back together for 'and' filtering
            filterValue = inclusives.length ? inclusives.join(',') : '*';
            // find each child element with current filter values

            currentTotalItems = $container.children(filterValue).length;
            $container.children(filterValue).each(function(){
                // increment page if a new one is needed
                if( item > itemsPerPage ) {
                    page++;
                    item = 1;
                }
                // add page number to element as a class
                wordPage = page.toString();
                
                var classes = $(this).attr('class').split(' ');
                var lastClass = classes[classes.length-1];

                // last class shorter than 4 will be a page number, if so, grab and replace
                if(lastClass.length < 4){
                    $(this).removeClass();
                    classes.pop();
                    classes.push(wordPage);
                    classes = classes.join(' ');
                    $(this).addClass(classes);
                } else {
                    // if there was no page number, add it
                    $(this).addClass(wordPage); 
                }
                item++;
            });
        currentNumberPages = page;
    }();

    // create page number navigation
    var CreatePagers = function() {

        var $isotopePager = ( $('.'+pagerClass).length == 0 ) ? $('<div class="'+pagerClass+'"></div>') : $('.'+pagerClass);

        $isotopePager.html('');
        if(currentNumberPages > 1){
            $('#pagination-demo').twbsPagination('destroy');
            $('#pagination-demo').twbsPagination({
            totalPages: currentNumberPages,
            visiblePages: 5,
            first: "",
            last: "",
            prev: '<span aria-hidden="true"><i class="uil uil-arrow-left"></i></span>',
            next: '<span aria-hidden="true"><i class="uil uil-arrow-right"></i></span>',
            onPageClick: function (event, page) {
            //fetch content and render here
            goToPage(page);
            updateFilterCount();
        }
    });

        }
        else{
            $('#pagination-demo').twbsPagination('destroy');

        }
    }();
}

    
// remove checks from all boxes and refilter
function clearAll(){
    $checkboxes.each(function (i, elem) {
        if (elem.checked) {
            elem.checked = null;
        }
    });
    currentFilter = '*';
    setPagination();
    goToPage(1);
}

setPagination();
goToPage(1);
updateFilterCount();

//event handlers
$checkboxes.change(function(){
    var filter = $(this).attr(filterAttribute);
    currentFilter = filter;
    setPagination();
    goToPage(1);
    updateFilterCount();
});

$('#clear-filters').click(function(){clearAll()});
$('#clear-filters2').click(function(){clearAll()});

