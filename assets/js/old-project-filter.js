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
var $filterItem = $('.filter-item');
var $container = 
    $('#isotopeContainer').isotope({ 
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
    var selector = "";

        // for each box checked, add its value and push to array
        selector = itemSelector + '.'+ currentFilter;

        // smash all values back together for 'and' filtering
        filterValue = ( currentFilter != '*' ) ? selector : '*';
        var wordPage = currentPage.toString();
        filterValue += '.' +wordPage;

    changeFilter(filterValue);
}

function setPagination() {

    var SettingsPagesOnItems = function(){
        var itemsLength = $container.children(itemSelector).length;
        var pages = Math.ceil(itemsLength / itemsPerPage);
        var item = 1;
        var page = 1;
        var selector = "";

            // for each box checked, add its value and push to array
            selector = itemSelector + '.'+ currentFilter;
            filterValue = ( currentFilter != '*' ) ? selector : '*';

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
    currentFilter = '*';
    setPagination();
    goToPage(1);
}

//event handlers
$filterItem.click(function(){
    $filterItem.each(function(index){
        $(this).removeClass( "active" );
    })
    $('#clear-filters').removeClass( "active" );
    var filter = $(this).attr(filterAttribute);
    $(this).addClass( "active" );
    currentFilter = filter;
    setPagination();
    goToPage(1);

});

$('#clear-filters').click(function(){
    $filterItem.each(function(index){
        $(this).removeClass( "active" );
    })
    clearAll();
    $(this).addClass( "active" );
});

$(document).ready( function(){ 
    setPagination();
    goToPage(1);    
 });