if (!window.myPlugin) {
    window.myPlugin = {};
}

window.myPlugin.createWaterFall = function (option) {
    let defaultOption = {
        minGap: 10, // 图片之间的最小间隙
        imgSrcs: [], // 所有图片路径信息
        imgWidth: 220, // 单张图片的宽度
        container: document.body // 默认的图片容器是 body
    };

    option = Object.assign({}, defaultOption, option);

    let imgs = []; // 用于存放 img 对象
    // console.log(option);

    handleParent(); // 确保容器是相对定位
    createImgs(); // 创建图片元素

    let debounce = myPlugin.debounce(setImgPosition, 300);
    window.onresize = debounce; // 适应页面尺寸的变化
    /**
     * 向页面中插入图片
     */
    function createImgs() {
        let debounce = myPlugin.debounce(setImgPosition, 30);
        option.imgSrcs.forEach(src => {
            let img = new Image();

            img.src = src;
            img.style.width = option.imgWidth + "px";
            img.style.position = "absolute";
            img.style.transition = "0.3s";
            imgs.push(img);
            option.container.appendChild(img);
            img.onload = debounce;
        });
    }

    /**
     * 图片元素是绝对定位 其父级必须得是相对定位
     */
    function handleParent() {
        let style = getComputedStyle(option.container);
        if (style.position === 'static') {
            option.container.style.position = "relative";
        }
    }

    /**
     * 设置页面中的图片的位置
     */
    function setImgPosition() {
        let info = getHorizontalInfo();
        let arr = new Array(info.number).fill(0); // 每一列的高度值
        imgs.forEach(img => {
            // 设置图片的纵坐标
            let minTop = Math.min.apply(null, arr);
            img.style.top = minTop + "px";
            // 设置图片的横坐标
            let index = arr.indexOf(minTop);
            img.style.left = index * (option.imgWidth + info.gap) + "px";
            // 更新数组
            arr[index] += info.gap + img.clientHeight;
        });
        // 设置容器的高度
        let maxTop = Math.max.apply(null, arr);
        option.container.style.height = maxTop + "px";
        console.log(info);
    }

    /**
     * 获取水平方向上的相关信息
     * containerWidth   此时水平方向上的长度值
     * number           该长度所能容纳的图片量(取小)
     * gap              图片与图片之间的间隙值
     */
    function getHorizontalInfo() {
        let obj = {};
        obj.containerWidth = option.container.clientWidth;
        obj.number = Math.floor((obj.containerWidth + option.minGap) / (option.imgWidth + option.minGap));
        obj.gap = (obj.containerWidth - option.imgWidth * obj.number) / (obj.number - 1)

        /* console.log(`
        \n容器宽度: ${obj.containerWidth}, (第一次加载时会发现 该值比实际的要偏大)
        \n间距: ${obj.gap},
        \n图片数量: ${obj.number},
        \n所有图片的宽度: ${option.imgWidth * obj.number},
        \n所有间距的宽度: ${obj.gap * (obj.number - 1)}
        `); */
        /* 原因分析:
        一开始 页面是没有出现滚动条的 option.container.clientWidth 获取的就是没有出现滚动条的时候的值
        但是我们给 容器设置的 width: 90%; 它是等到页面加载完后, 才渲染上去的, 此时若一个屏幕展示不了所有的图片
        就会出现滚动条, 90% 是不考虑滚动条的尺寸的 所以实际得到的值会偏小 就会出现图片溢出的效果 */
        return obj;
    }
}
