
const dataPath = "./data/nextstrain_ncov_open_global_metadata.tsv"
const deathPath = './data/overview_2022-04-08.csv'

const  controlArray = []
d3.tsv(dataPath).then(function (data){
    let allDate = (data.map(d => d.date))
    let allcladeMembership = (data.map(d => d.clade_membership))

    var newDate = convertToDate(allDate)

    //create dict
    var dataDict = []
    for(var i=0;i<newDate.length;i++){
        dataDict.push({
            date:newDate[i],
            value:allcladeMembership[i]
        })
    }
    console.log("all member printed",dataDict)

    //unique member
    let uniqueClades = [...new Set(allcladeMembership)]

    let lastDayList = getLastDay()

    var lastDay = []
    var indexOfDate = []

    for(var i =0;i<newDate.length;i++)
        for(var j=0;j<lastDayList.length;j++){
            if(newDate[i].getTime()==lastDayList[j].getTime()){
                lastDay.push(newDate[i])
                indexOfDate.push(i)
            }
        }

    //only the end of month
    var newDataPie = []
    for(var i=0;i<indexOfDate.length;i++)
        newDataPie.push({
            date:newDate[indexOfDate[i]],
            value:allcladeMembership[indexOfDate[i]],
            index:indexOfDate[i]
        })
    console.log("new date pie",newDataPie)

    //remove same element
    //get correlated index
    var newDataPieIndex= []
    newDataPieIndex[0] = 0
    for(var i=0;i<newDataPie.length-1;i++){
        if(newDataPie[i].date.toString() != newDataPie[i+1].date.toString())
            newDataPieIndex.push(newDataPie[i].index)
        else
            continue
    }

    //count label number
    //choose range
    let uniqueClades_0 = [...new Set(allcladeMembership.slice(newDataPieIndex[2],newDataPieIndex[3]))]


    var uniqueClades_dict = new Array()
    //init dict
    for(var i=0;i<uniqueClades_0.length;i++)
        uniqueClades_dict[uniqueClades_0[i]] = 0

    // console.log("prinit dict",uniqueClades_dict)
    var cladesDictPie = []
    for(var i=newDataPieIndex[2];i<newDataPieIndex[3];i++){
        uniqueClades_dict[allcladeMembership[i]]++
    }

    for(var key in uniqueClades_dict){
        cladesDictPie.push({name:key,value:uniqueClades_dict[key]})
    }

    drawPieChart(cladesDictPie)


})

function drawPieChart(data){
    var width = 400,
        height = 400,
        padding = {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40
        };

    var colors = d3.schemeSet2;

    var svg = d3.select("#pie-svg")
        .append('svg')
        .attr('width', (width * 2) + 'px')
        .attr('height', (height * 2) + 'px');

    // 生成饼布局
    var pie = d3.pie().value(function(d) {
        return d.value;
    })(data);

    var radius = Math.min(width, height);

    /*
     * 弧线生成器
     * .innerRadius 内圆半径
     * .outerRadius 外圆半径
     * .centroid 计算弧的中心
     */
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius / 2);

    // 一个更大的圆弧，用来获取标注线外圈的坐标
    var outArc = d3.arc()
        .innerRadius(radius / 2.5)
        .outerRadius(radius/1.2);

    //larger radius
    const arcLarger = d3.arc()
        .outerRadius(radius/2 * 1.1)
        .innerRadius(0)

    //normal radius
    const arcNormal = d3.arc()
        .outerRadius(radius/2)
        .innerRadius(0);

    var line = d3.line()
        .x(function(d) {
            return d[0];
        })
        .y(function(d) {
            return d[1];
        });

    // 获取标注线的点数据
    var getLabelLine = function(d, type) {
        var startPos = d.startAngle + (d.endAngle - d.startAngle) / 2;
        var data = [];
        var ra = (type === "text") ? 2.5 : 1;
        data.push(arc.centroid(d));
        data.push(outArc.centroid(d));
        data.push({
            0: outArc.centroid(d)[0] + (40 * (startPos < Math.PI ? 1 : -ra)),
            1: outArc.centroid(d)[1]
        });

        return data;
    }

    var containers = svg.append("g")
        .attr("transform", "translate(" + height + "," + height + ")");

    var container = containers.selectAll("g")
        .data(pie)
        .join("g");

    // 绘制饼图
    container.append("path")
        .attr("stroke", "white")
        .attr("d", arc)
        .attr("fill", function(d, i) {
            return colors[i];
        });

    // 绘制标注线
    container.append("path")
        .datum(function(d) {
            return getLabelLine(d, "path");
        })
        .attr("class", "tips")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    // 绘制标注线上文字
    container.append("text")
        .datum(function(d) {
            d.pos = getLabelLine(d, "text")[2];
            return d;
        })
        .text(function(d) {
            return (d.data.name);
        })
        .attr("dx", function(d) {
            return d.pos[0]
        })
        .attr("dy", function(d) {
            return d.pos[1]
        });
    //second
    container.append("text")
        .datum(function(d) {
            d.pos = getLabelLine(d, "text")[2];
            return d;
        })
        .text(function(d) {
            return ("Num: "+d.data.value);
        })
        .attr("dx", function(d) {
            return d.pos[0]-10
        })
        .attr("dy", function(d) {
            return d.pos[1]-20
        });

    //tittle
    svg.append('text')
        .classed('title', true)
        .attr('x', width)
        .attr('y', -20)
        .attr('dy', '2em')
        .text('Clade Membership Pie Chart')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('stroke', 'black');

    let tooltip = d3.select('body').append('div');
    container.on('mouseover', function(event){
        var lanel
        const[x, y] = d3.pointer(event);
        d3.select(this).select('path').transition().attr('d', arcLarger)

        // tooltip.html("111").transition().duration(500).style('left', x+"px")
        //     .style('top', y+"px").style('opacity', 1.0);

    }) .on('mouseleave', function(){
        d3.select(this).select('path').transition().attr('d', arcNormal)
        // tooltip.transition().style('opacity',0)
    })

    //label
    let label=svg.selectAll('.label')      //添加右上角的标签
        .data(data)
        .enter()
        .append('g')
        .attr("transform","translate(" + (width / 2 + radius/2 * 2.3) + "," + 20 + ")");
    label.append('rect')        //标签中的矩形
        .style('fill',function(d,i){
            return colors[i];
        })
        .attr('x', 0)
        .attr("y",function(d,i){
            return (height - radius/2) / 2 + (i - 1) * 30;
        })
        .attr('rx','10')     //rx=ry 会出现圆角
        .attr('ry','10')
        .attr('width',50)
        .attr('height',20);
    label.append('text')            //标签中的文字
        .attr('x',function(d,i){
            return 65;              //因为rect宽度是50，所以把文字偏移15,在后面再将文字设置居中
        })
        .attr("y",function(d,i){
            return (height - radius/2) / 2 + 15 + (i - 1) * 30;
        })
        .text(function(d){
            return d.name;
        })
        .style({
            "font-size":"10px",
            "text-anchor":"middle",
            'fill':"white",
            "font-weight":600
        });

    // 图注个数
    let count = 0;
    let before = 0;
    // 图注文字
    let text=svg.selectAll(".text")
        .data(data) //返回是pie(data0)
        .enter().append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .append("text")
        .style('text-anchor', function(d, i) {
            //根据文字在是左边还是右边，在右边文字是start，文字默认都是start。
            return (d.startAngle + d.endAngle)/2 < Math.PI ? 'start' : 'end';
        })
        .attr('transform', function(d, i) {
            var pos = arc.centroid(d);      //centroid(d)计算弧中心
            pos[0] = radius/2*((d.startAngle+d.endAngle) / 2 < Math.PI ? 1.4 : -1.4)})



}


d3.csv(deathPath).then(function (data){
    let allDate = (data.map(d => d.date))
    let allDeathNum = (data.map(d => d.cumDeaths28DaysByDeathDate))
    // console.log(allDate)
    // console.log(allDeathNum)

    //count all valid data
    var k =0

    for (let i = 0; i < allDeathNum.length; i++) {
        if (allDeathNum[i]!=="") {
            continue
        }
        else
        {
            k=i
            break
        }
    }
    //slice array
    allDeathNum = allDeathNum.slice(0,k)
    allDate = allDate.slice(0,k)
    // console.log(allDeathNum)
    // console.log(allDate)
    var newDate = convertToDate(allDate)
    console.log(newDate)

    let lastDayList = getLastDay()
    var lastDay = []
    var indexDeathPerMonth = []
    var deathPerMonth = []


    for(var i =0;i<newDate.length;i++)
        for(var j=0;j<lastDayList.length;j++){
            if(newDate[i].getTime()==lastDayList[j].getTime()){
                lastDay.push(newDate[i])
                indexDeathPerMonth.push(i)
                deathPerMonth.push(allDeathNum[i])
            }
        }

    //sort to ascending order
    deathPerMonth.reverse()
    lastDay.reverse()

    var deathPerMonthUpdate = []
    //update death per month
    deathPerMonthUpdate.push(deathPerMonth[0])
    for(var i=0;i<deathPerMonth.length-1;i++) {
        var curNum = deathPerMonth[i]
        var nextNum = deathPerMonth[i+1]
        deathPerMonthUpdate.push(nextNum-curNum)
    }
    console.log("test death",deathPerMonthUpdate)
    // console.log("new day last",lastDay)
    // console.log("all death per month",deathPerMonth)

    var resdict = []
    for(var i=0;i<lastDay.length;i++){
        resdict.push({
            date:lastDay[i],
            value:deathPerMonthUpdate[i]
        })
    }
    console.log("resdict",resdict)


    var min = d3.min(resdict, function(d) {
        return d.value;
    })
    var max = d3.max(resdict, function(d) {
        return d.value;
    })

    // 图表的宽度和高度
    var width = 1000,
        height = 500,
        padding = {
            top: 10,
            right: 40,
            bottom: 40,
            left: 40
        };
    //xscale
    var xScale = d3.scaleTime()
        .domain(d3.extent(resdict, function(d) {
            return d.date;
        }))
        .range([padding.left, width - padding.right]);
    //yscale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(resdict, function(d) {
            return d.value;
        })])
        .range([height - padding.bottom, padding.top]);
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

    var svg = d3.select('body')
        .append('svg')
        .attr('width', width + 'px')
        .attr('height', height + 'px');
    var xAxis = d3.axisBottom()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
        .call(xAxis);
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(yAxis);


    //ling plot
    var linePath = d3.line()
        .x(function(d){ return xScale(d[0]) })
        .y(function(d){ return yScale(d[1]) });

    var line = d3.line()
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.value);
        });

    // 生成折线
    svg.append("path")
        .datum(resdict)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    for(var i=0;i<deathPerMonthUpdate.length;i++)
        deathPerMonthUpdate[i] = deathPerMonthUpdate[i].toString()
    console.log("date value is",deathPerMonthUpdate)

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("");

    let circle = resdict.forEach((d,i) => {
        svg.append("circle")
            .data(resdict)
            .attr("id", "circleTooltip")
            .attr("cx", xScale(d.date))
            .attr("cy", yScale(d.value))
            .attr("r", 5)
            .on("mouseover", function(d,i,n){
                d3.select(this)
                .attr("fill","red")

                // console.log(deathPerMonthUpdate[i])
                // return tooltip.style("visibility", "visible").text(deathPerMonthUpdate[i])
            })
            .on("mouseout", function(){
                    d3.select(this)
                        .attr("fill","black")
                return tooltip.style("visibility", "hidden")
                })
    })



    // d3.selectAll("circle").on("mouseover", d => {
    //     tooltip.style("opacity",1)
    //         .html(<p class="show text"> ${d.value} </p>)

})

function convertToDate(dateArray){
    //  Convert a "dd/MM/yyyy" string into a Date object
    var newArry = []
    for(var i=0;i<dateArray.length;i++){
        let d = dateArray[i].split("/")
        let dat = new Date(d[2] + '/' + d[1] + '/' + d[0])
        newArry.push(dat)
    }
    return newArry
}

function getLastDay(){
    var year = 2020
    var month = 0
    var lastDayArr = []
    for(var i =0;i<=2;i++)
        for(var j =1;j<=12;j++){
            var d = new Date(2020+i, month + j, 0)
            lastDayArr.push(d)
        }

    console.log("last day",lastDayArr)
    return lastDayArr
}



