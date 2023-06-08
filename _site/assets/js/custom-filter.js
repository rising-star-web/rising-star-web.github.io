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
var currentFilter = '*';
var filterAttribute = 'data-filter';
var filterValue = "";

// update items based on current filters    
function changeFilter(selector) { $container.isotope({ filter: selector }); }

//grab all checked filters and goto page on fresh isotope output
function loadItems() {
    var inclusives = [];
    var output = [];

        // for each box checked, add its value and push to array
        $checkboxes.each(function (i, elem) {
            if (elem.checked) {
                inclusives.push('.'+elem.value);
                output.push(elem.value.replace(/([a-z])(\d)/gi, '$1 $2'))
            }
        });

        // smash all values back together for 'and' filtering
        filterValue = inclusives.length ? inclusives.join(',') : '*';
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
        if(iso.filteredItems.length > 1){
            $containerLength.text( itemText )   
        }
        else{
        $containerLength.text( "未找到任何结果。" );   
        }
    }

  }

// remove checks from all boxes and refilter
function clearAll(){
    $checkboxes.each(function (i, elem) {
        if (elem.checked) {
            elem.checked = null;
        }
    });
    currentFilter = '*';
    loadItems();
}

loadItems()
updateFilterCount();

//event handlers
$checkboxes.change(function(){
    var filter = $(this).attr(filterAttribute);
    currentFilter = filter;
    loadItems()
    updateFilterCount();
});

$('#clear-filters').click(function(){clearAll()});
$('#clear-filters2').click(function(){clearAll()});

