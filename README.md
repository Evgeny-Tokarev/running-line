# running-line


## Running-line javaScript widget.

### Installation:

> npm install running-line

### Usage:

Html:

     <div id="myLine">
       <div>
         <ul>
           <li>
             <a href="#">First item text</a>
           </li>
           <li>
             <a href="#">Second item text</a>
           </li>
           <li>
             <a href="#">Third item text</a>
           </li>
         </ul>
       </div>
     </div>   


You can use other html tags, but it is important to keep the structure inheritance, however "li" elements may not contain any child elements.

JavaScript:


> const line = new RunningLine(12000, true, true, true)
> line.runLine("#myLine")


Parameters:

1. Animation duration(default: 5000)
2. Direction of animation(default: false(left to rigth))
3. Stop animation, when hover on any item(defaul: false)
4. Allocates space between items to avoid disproportionate gap(dafaul: false)


