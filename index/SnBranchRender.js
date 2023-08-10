
(root => {
    function isRDLocation(){
        return location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    }
    function SnBranchRender(){
        this.book = 45 // 目前不會被變動
        this.chap = 0
        this.isTitleChangeBack = false
    
        that = this
        $(document).on('InfoTitleChanged', function (event, data){
            if ( data.titleId == "fhlSnBranch"){
                that.isTitleChangeBack = true
            }
        })
    }
    
    SnBranchRender.prototype.render = function(ps){ 
        var dom2 = document.getElementById("fhlInfoContent");
        if ( ps.bookIndex != 45){
            dom2.innerHTML = "<p>尚未取得版權</p>"
            return 
        } 
        if ( this.chap == ps.chap && this.book == ps.bookIndex && that.isTitleChangeBack == false ){
            // 目前還沒有直接切換到對應頁面，所以沒有切換
            // 但這個保護，會在從別的功能切回來的時候，讓 render 不會生效
            return 
        }
        
        if ( dom2 != null ){
            this.book = ps.bookIndex
            this.chap = ps.chap
            that.isTitleChangeBack = false
    
            function generateUrlSnTree(chap){
                // 目前只購買了羅馬書，45，其它都沒有
                chapstr = chap.toString().padStart(3, '0'); // 016
                
                var r1 = (isRDLocation() ? 'https://bible.fhl.net' : '')

                return [`${r1}/tree/45/45_${chapstr}.pdf`,
                `${r1}/tree/45/45_${chapstr}e.pdf`]
            }
            function generatePdfHtml(url){
                // url = "https://bible.fhl.net/tree/45/45_016.pdf"
                return `  <object data="`+ url +`" type="application/pdf" width="100%" height="48%">
                <p>抱歉，您的瀏覽器不支持顯示 PDF。您可以下載文件：<a href="`+url+`">下載 PDF</a></p>
            </object>`
            }
            
            urls = generateUrlSnTree(this.chap)
            dom2.innerHTML = generatePdfHtml(urls[0]) + generatePdfHtml(urls[1])
        }
    }

    // singleton
    SnBranchRender.s = new SnBranchRender() // 直覺雖然是 SnBranchRender.prototype.s 但實測後，這樣才對。

    root.SnBranchRender = SnBranchRender
})(this)