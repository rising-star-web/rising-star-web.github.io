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
function init() {
    var selector = "";

        // for each box checked, add its value and push to array
        selector = itemSelector + '.'+ currentFilter;

        // smash all values back together for 'and' filtering
        filterValue = ( currentFilter != '*' ) ? selector : '*';
        
    changeFilter(filterValue);
}

    
// remove checks from all boxes and refilter
function clearAll(){
    currentFilter = '*';
    init();
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
    init();    
});

$('#clear-filters').click(function(){
    $filterItem.each(function(index){
        $(this).removeClass( "active" );
    })
    clearAll();
    $(this).addClass( "active" );
});

$(document).ready( function(){ 
    init();    
 });