var selectionPanel = {
	selectorField:"selector_field",
	targetField:"target_field",
	speed:200,
	selectorDOM:null,
	targetDOM:null,
	queryMat:[],
	dimList:null,
	focusDimNum:3
};

selectionPanel.initDOM = function(){
	this.selectorDOM = $("#"+this.selectorField);
	this.targetDOM = $("#"+this.targetField);
	// Empty the DOMs
	this.selectorDOM.empty();
	$('dim_btn_group').remove();
};

selectionPanel.initQueryMat = function(){
	this.queryMat = [];
	for(var i in this.dimList)
	{
		var tempList = [];
		for (var j=0;j<this.dimList[i].len;j++)
		{
			tempList.push(true);
		}
		this.queryMat.push(tempList);
	}
};

// newDim: {name(str), len(int), labels(array<str>)}
selectionPanel.addDim = function(dimIndex){
	newDim = this.dimList[dimIndex];
	// Selector Breadcrumb
	if (dimIndex < this.focusDimNum)
	{
		this.selectorDOM.append('<li><span class="clickable switcher focus">'+newDim.name+'</span></li>');
	}
	else
	{
		this.selectorDOM.append('<li><span class="clickable switcher">'+newDim.name+'</span></li>');
	}
	// Target Panel
	this.targetDOM.append('<div class="btn-group dim_btn_group" data-toggle="buttons"></div>');
	var btnGroup = this.targetDOM.children(".dim_btn_group").last();
	var labels = newDim.labels;

	for (var i in labels){
		btnGroup.append('<label class="btn btn-default sel_btn rounded checked">'+labels[i]+'</label>');
	}
	// Event Listeners
	btnGroup.children().click(function(e){
		// Locate the flag
		var dimIndex = $(this).parent().index(".dim_btn_group");
		var labelIndex = $(this).index();

		if (dimIndex >= selectionPanel.focusDimNum)
		{
			// Nothing happens
			return;
		}

		if($(this).hasClass('checked'))
		{
			$(this).removeClass('checked');
			// change flag to false
			selectionPanel.queryMat[dimIndex][labelIndex] = false;
			heatmapContainer.refreshHeatmap(1,dimIndex,labelIndex,0);
			themeriver.setData();
		}
		else
		{
			$(this).addClass('checked');
			// change flag to true
			selectionPanel.queryMat[dimIndex][labelIndex] = true;
			heatmapContainer.refreshHeatmap(1,dimIndex,labelIndex,1);
			themeriver.setData();
		}
		selectionPanel.setQueryDisplay();
	});

};

selectionPanel.addDimList = function(){
	for (var i in this.dimList)
	{
		this.addDim(i);
	}
	// Set queryMat
	this.initQueryMat();
};


selectionPanel.start = function() {
	this.initDOM();
	this.addDimList();
	// Show the first dim
	this.selectorDOM.children().first().children().addClass("display");
	this.targetDOM.children(".dim_btn_group").first().addClass("display");
	this.show();

	// Set event
	this.selectorDOM.children().each(function(){
		$(this).children().first().click(function(){
			var index = $(this).parent().index();
			// Set selector display
			$(".switcher").removeClass("display");
			$(this).addClass("display");
			// Set dimension panel display
			selectionPanel.targetDOM.children(".dim_btn_group").removeClass("display");
			selectionPanel.targetDOM.children(".dim_btn_group").eq(index).addClass("display");

			selectionPanel.show();
		});
	});

	this.setQueryDisplay();
};

selectionPanel.show = function () {
	$('.dim_btn_group').each(function() {
		$(this).fadeOut(0);
	});
	$('.dim_btn_group.display').each(function() {
		$(this).fadeIn(selectionPanel.speed);
		selectionPanel.targetDOM.height($(this).height()+25);
	});
};

selectionPanel.printQueryDim = function(dimIndex){
	var dimLabels = this.dimList[dimIndex];
	var dimFlags = this.queryMat[dimIndex];
	var showAllFlag = true;
	var resultStr = "{"+dimLabels.name+":";
	for(var i in dimFlags)
	{
		if (!dimFlags[i]) showAllFlag = false;
		else
		{
			resultStr += '"'+dimLabels.labels[i]+'",';
		}
	}
	// Remove last comma
	if (resultStr.charAt(resultStr.length-1) == ",")
		resultStr = resultStr.substring(0,resultStr.length-1);
	else
		resultStr += "none";

	if (showAllFlag) resultStr = "";
	else resultStr += "};";

	return resultStr;
};

selectionPanel.setQueryDisplay = function(){
	var dimStr = "";
	var currQueryDOM = $("#curr_query_text");
	var prefix = "Your Selection: ";
	var queryStr = "";
	for(var i in this.queryMat)
	{
		dimStr = this.printQueryDim(i);
		queryStr += dimStr;
	}
	if (queryStr == "") queryStr = "Select all";
	prefix += queryStr;
	currQueryDOM.html(prefix);
};