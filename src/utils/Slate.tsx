import React, { useMemo, useRef, useEffect ,useState,useCallback} from 'react';
import {Editor,Transforms,Text,createEditor,Descendant, Range as SlateRange,Element as SlateElement,} from 'slate';
import { Slate, Editable, withReact, useSlate, useFocused, useSelected,useSlateStatic,ReactEditor } from 'slate-react';
import {  Menu, Portal } from './components'
import isUrl from 'is-url'
import { css } from '@emotion/css'
import { FormatBold, FormatItalic, FormatUnderlined,LinkOutlined,LinkOffOutlined,Delete } from "@mui/icons-material";
import imageExtensions from 'image-extensions'
import { Button} from "@mui/material";


export const SlateFun:any = {
  TEXT_FORMAT_TYPES :['bold','italic','underline','link'],//['bold','italic','underline','link','linkoff']
  TEXT_ALIGN_TYPES : ['left', 'center', 'right', 'justify'],
  LIST_TYPES : ['numbered-list', 'bulleted-list'],
  getToolText:(tool:string)=>{
    const texts:{[key:string]:string} = {'numbered-list':'Number list',
    'bulleted-list':'Bullet list',
    'left':'Left',
    'center':'Center',
    'right':'Right',
    'justify':'Justify'
     };
    return texts[tool]?(texts[tool]):'';
  },  
  isButtonCollapsed:false,
  //slate element
  Element :(props:any) => {
    const { attributes, children, element } = props
    const style = { textAlign: element.align,fontFamily:element.fontFamily }
    const styleP = { textAlign: element.align}
    switch (element.type) {
      case 'block-quote':
        return (
          <blockquote style={style} {...attributes}>
            {children}
          </blockquote>
        )
      case 'bulleted-list':
        return (
          <ul style={style} {...attributes}>
            {children}
          </ul>
        )
      case 'heading-one':
        return (
          <h1 style={style} {...attributes}>
            {children}
          </h1>
        )
      case 'heading-two':
        return (
          <h2 style={style} {...attributes}>
            {children}
          </h2>
        )
      case 'list-item':
        return (
          <li style={style} {...attributes}>
            {children}
          </li>
        )
      case 'numbered-list':
        return (
          <ol style={style} {...attributes}>
            {children}
          </ol>
        )
      case 'link':
        return <SlateFun.LinkComponent {...props} />
      case 'button':
        return <SlateFun.ButtonComponent  {...props} />
      case 'image':
          return <SlateFun.ImageComponent {...props} />
      default:
        return (
          <p style={styleP} {...attributes}>
            {children}
          </p>
        )
    }
  },
  //slate leaf
  Leaf : (props:any) => {
    let { attributes, children, leaf } = props
    if (leaf.bold) {
      children = <strong>{children}</strong>
    }
    if (leaf.code) {
      children = <code>{children}</code>
    }
    if (leaf.italic) {
      children = <em>{children}</em>
    }
    if (leaf.underline) {
      children = <u>{children}</u>
    }
    if (leaf.underlined) {
      children = <u>{children}</u>
    }
    if(leaf.fontSize){
      children = <span
      style={{
        fontSize: parseInt(leaf.fontSize),
        verticalAlign: 'middle'
      }}
    >
      {children}
    </span>
    }
    if(leaf.color){
      children = <span
      style={{
        color: leaf.color,
        verticalAlign: 'middle'
      }}
    >
      {children}
    </span>
    }
    if(leaf.fontFamily){
      children = <span
      style={{
        fontFamily: leaf.fontFamily,
        verticalAlign: 'middle'
      }}
    >
      {children}
    </span>
    }
    
    return <span {...attributes}>{children}</span>
  },
  toggleFormat : (editor:any, format:string,value?:any) => {
    const isActive = SlateFun.isFormatActive(editor, format)
    let property = SlateFun.TEXT_FORMAT_TYPES.includes(format) ? 'type' : 'style';
    let newProperty:any
    if(format=='fontFamily'||format ==="fontSize"){
      newProperty= { [format]: value};
      if(SlateFun.isCollapsed(editor)){
        // isLinkActive
        if(SlateFun.isLinkButtonActive(editor)){
          let links=SlateFun.getLinkSetting(editor,1)
          Transforms.select(editor,links)
          Transforms.setNodes(
            editor,
            newProperty,
            { match: Text.isText, split: true }
          ) 
        }else{
          let child=JSON.parse(JSON.stringify(editor.children))
          SlateFun.resetChildren(child,format,value)
          editor.children=child;
          Transforms.setNodes(editor,newProperty)
        }
      }else{
        Transforms.setNodes(
          editor,
          newProperty,
          { match: Text.isText, split: true }
        ) 
      }
    }else{
      Transforms.setNodes(
        editor,
        { [format]: isActive ? null: (property==='type'?true:value)},
        { match: Text.isText, split: true }
      ) 
    }
  },
  resetChildren:(arr:any,format:any,value:any)=>{
    arr.forEach((item:any)=>{
      if(item.children&&item.children.length>0){
        SlateFun.resetChildren(item.children,format,value)
      }else{
        item[format]=value
      }
    })
  },

  isFormatActive : (editor:any,format:string) => {
    const [match] = Editor.nodes(editor, {
      match: (n:any) => n[format] === true,
      mode: 'all',
    })
    return !!match
  },
  getFormat:(editor:any, format:string) => {
    const marks:any = Editor.marks(editor)
    let property = SlateFun.TEXT_FORMAT_TYPES.includes(format) ? 'type' : 'style';
    if(property === 'style'){
      return marks ? marks[format] : null
    }else{
      return marks ? marks[format] === true : false
    }
  },
  FormatButton:({ formats,changeDialogLink}:any)=>{
    const editor = useSlate()
    let ele:any
    if(formats ==='bold'){
      ele =  <FormatBold  sx={{ color: SlateFun.isFormatActive(editor, formats)?'white': '#aaa' }} 
      onClick={() => SlateFun.toggleFormat(editor, formats)}/>
    }
    if(formats ==='italic'){
      ele = <FormatItalic  sx={{ color: SlateFun.isFormatActive(editor, formats)?'white': '#aaa' }} 
      onClick={() => SlateFun.toggleFormat(editor, formats)}/>
    }
    if(formats ==='underline'){
      ele = <FormatUnderlined  sx={{ color: SlateFun.isFormatActive(editor, formats)?'white': '#aaa' }} 
      onClick={() => SlateFun.toggleFormat(editor, formats)}/>
    }
    if(formats ==='link'){
      ele = <LinkOutlined  sx={{ color: SlateFun.isLinkActive(editor)?'white': '#aaa' }} 
      onClick={(event:any) =>{
        event.preventDefault()
        let defalutUrl=SlateFun.getLinkSetting(editor)
        changeDialogLink(defalutUrl);
      } }/>
    }
    if(formats ==='linkoff'){
      ele = <LinkOffOutlined  sx={{ color: SlateFun.isLinkActive(editor)?'white': '#aaa' }} 
      onClick={() => {
        if (SlateFun.isLinkActive(editor)) {
          SlateFun.unwrapLink(editor)
        }
      }}/>

    }
   
    return ele
  },
  // hoverTool
  HoveringToolbar : (props:any) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const editor = useSlate()
    const inFocus = useFocused()
    useEffect(() => {
      const el:any = ref.current
      const { selection } = editor
      if(props.setFocus){
        props.setFocus(inFocus)
      }
      if (!el) {
        return
      }
      if (
        !selection ||
        !inFocus ||
        SlateRange.isCollapsed(selection) ||
        Editor.string(editor, selection) === ''||
        SlateFun.isButtonCollapsed
      ) {
        el.removeAttribute('style')
        return
      }
      const domSelection = window.getSelection()
      const domRange = domSelection!.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()
      let left=rect.left + window.pageXOffset -el.offsetWidth / 2 +rect.width / 2
      el.style.opacity = '1'
      el.style.top = `${(rect.top + window.pageYOffset - el.offsetHeight)<5?(rect.top + window.pageYOffset + el.offsetHeight):(rect.top + window.pageYOffset - el.offsetHeight)}px`
       el.style.left = Number(left) < 4 ? '4px' :left+'px'
    })
    return (
      <>
     {props.config==null||props.config.length>0?
      <Portal>
        <Menu
          ref={ref}
          className={css`
            padding: 8px 7px 6px;
            position: absolute;
            cursor: pointer;
            z-index: 1;
            top: -10000px;
            left: -10000px;
            margin-top: -6px;
            opacity: 0;
            background-color: #222;
            border-radius: 4px;
            transition: opacity 0.75s;
          `}
          onMouseDown={(e:any) => {
            // prevent toolbar from taking focus away from editor
            e.preventDefault()
          }}
        >
          
         {SlateFun.resetTypes('TEXT_FORMAT_TYPES',props.config).map((format:any,index:any)=>{           
            return (
                  <SlateFun.FormatButton key={index} formats={format} changeDialogLink={props.changeDialogLink}/>
                )             
              }
            )
          }
        </Menu>
       </Portal>
       :null}
       </>
    )
  },
  resetTypes:(type:any,config:any)=>{
    let arr:any;
    arr = config?SlateFun[type].filter((item:any)=> config.includes(item)):SlateFun[type]
    return arr
  },
  //star new 20221021--s
  MarkButton :({ format, icon }:any) => {
    const editor = useSlate()
    return (
      <SlateFun.FormatButton  formats={format}  onMouseDown={(event:any) => {
        event.preventDefault()
        SlateFun.toggleMark(editor, format)
      }}/>
    )
  },

  toggleMark : (editor:any, format:string,value?:any) => {
    const isActive = SlateFun.isMarkActive(editor, format)
  
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, value?value:true)
    }
  },
  isMarkActive : (editor:any, format:string) => {
    const marks:any = Editor.marks(editor)
    return marks ? marks[format] === true : false
  },
  toggleBlock : (editor:any, format:string,value?:any) => {
    const isActive = SlateFun.isBlockActive(
      editor,
      format,
      SlateFun.TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
    )
    const isList = SlateFun.LIST_TYPES.includes(format)
    Transforms.unwrapNodes(editor, {
      match: (n:any) =>SlateFun.LIST_TYPES.includes(n.type)&&
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        !SlateFun.TEXT_ALIGN_TYPES.includes(format),
      split: true,
    })
    // let newProperties: Partial<SlateElement>
    let newProperties: any
    if (SlateFun.TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      }
    } else {
      newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
      }
    }
    Transforms.setNodes<SlateElement>(editor, newProperties)
    if (!isActive && isList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  },
  //star new 20221021--e
  isBlockActive : (editor:any, format:string, blockType:string= 'type') => {
    const { selection } = editor
    if (!selection) return false
  
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n:any) =>!Editor.isEditor(n)&&n[blockType] === format&&SlateElement.isElement(n)
      })
    )
  
    return !!match
  },
  //reset editor(link&&image)
  withEditor:(editor:any) => {
    const { insertData, insertText, isInline,isVoid } = editor
  
    editor.isInline = (element:any) =>
      ['link', 'button'].includes(element.type) || isInline(element)
  
    editor.isVoid = (element:any) => {
      return element.type === 'image' ? true : isVoid(element)
    }

    editor.insertText = (text:any) => {
      if (text && isUrl(text)) {
        SlateFun.wrapLink(editor, text)
      } else {
        insertText(text)
      }
    }
  
    editor.insertData = (data:any) => {
      const text = data.getData('text/plain')
      const { files } = data
  
      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader()
          const [mime] = file.type.split('/')
  
          if (mime === 'image') {
            reader.addEventListener('load', () => {
              const url:any = reader.result
              SlateFun.insertImage(editor, url)
            })
  
            reader.readAsDataURL(file)
          }
        }
      } else if (SlateFun.isImageUrl(text)) {
        SlateFun.insertImage(editor, text)
      }else if (text && isUrl(text)) {
        SlateFun.wrapLink(editor, text)
      } else {
        insertData(data)
      }
    }
  
    return editor
  },
  // link
  wrapLink:(editor:any, url: any,type?:any,style?:any,newUrl?:any) => {
    SlateFun.isButtonCollapsed=false;
    const { selection } = editor
    const isCollapsed = selection && SlateRange.isCollapsed(selection)
    
    let source = type==='select'?{
      sourceType:'select',
      sourceData:url
    }:{sourceType:'input'}

    let valUrl = type==='select'?url.id:url

    let linkStyle=style==='button'?{
      style:'button',setting:{size:'small',variant:'outlined'}
    }:{style:'none'}

    let link: any = {
      type: 'link',
      url:valUrl,
      children: isCollapsed ? [{ text: url }] : [],
      source:source,
      styleConfig:linkStyle
    }
    if(newUrl){
      link=newUrl
    }
  
    if (isCollapsed) {
      return;
      // Transforms.insertNodes(editor, link)
    } else {
      if (SlateFun.isLinkActive(editor)) {
        SlateFun.unwrapLink(editor)
      }
      Transforms.wrapNodes(editor, link, { split: true })
      Transforms.collapse(editor, { edge: 'end' })
    }
    ReactEditor.focus(editor)
  },
  //取消link
  unwrapLink : (editor:any) => {
    Transforms.unwrapNodes(editor, {
      match: (n:any) =>n.type === 'link'&&
        !Editor.isEditor(n) && SlateElement.isElement(n)
    })
  },
  isLinkActive:(editor:any) => {
    const [link] = Editor.nodes(editor, {
      match: (n:any) =>n.type === 'link'&& 
        !Editor.isEditor(n) && SlateElement.isElement(n)
    })
    return !!link
  },
  isLinkButtonActive:(editor:any) => {
    if(SlateFun.isLinkActive(editor)){
      let defalutUrl:any=SlateFun.getLinkSetting(editor)
      let newLink:any=JSON.parse(JSON.stringify(defalutUrl))
      return newLink.styleConfig.style=='button'?true:false
    }else{
      return false
    }
  },
  getLinkSetting:(editor:any,n?:any) => {
      const [link] = Editor.nodes(editor, {
        match: (n:any) =>n.type === 'link'&& 
          !Editor.isEditor(n) && SlateElement.isElement(n)
      })
      if(n){
        return link?link[1]:[]
      }else{
        return link?link[0]:''
      }
  },
  insertLink : (editor:any, url:any,type:any) => {
    const { selection } = editor
    const isCollapsed = selection && SlateRange.isCollapsed(selection)
    if (selection) {
      if(SlateFun.isLinkActive(editor)){
        let defalutUrl:any=SlateFun.getLinkSetting(editor)
        let newLink:any=JSON.parse(JSON.stringify(defalutUrl))
       
        newLink.url = type==='select'?url.id:url
        newLink.source = type==='select'?{
          sourceType:'select',
          sourceData:url
        }:{sourceType:'input'}
        if(isCollapsed){
          let links=SlateFun.getLinkSetting(editor,1)
          Transforms.select(editor,links)
        }
        SlateFun.wrapLink(editor, newLink,type,newLink.styleConfig.style,newLink)
      }else{
        SlateFun.wrapLink(editor, url,type)
      }
    }
  },
  LinkComponent : ({ attributes, children, element }:any) => {
    const selected = useSelected()
    const style=element.styleConfig.style;
    let cssName='';
    if(element.styleConfig.style=='button'){
      let setting=element.styleConfig.setting;
      let size=setting.size
      let variant=setting.variant
      cssName='btn'
      if (size=='small'){
        cssName+=' btn-sm'
      }else if(size=='large'){
        cssName+=' btn-lg'
      }
      if (variant=='outlined'){
        cssName+=' btn-outline-success'
      }else{
        cssName+=' btn-success'
      }
    }else{
      cssName=''
    }
    let link:any= element.source.sourceType==='select'?'{link:'+element.source.sourceData.content_type+','+element.url+'}':element.url
    // className={
    //   selected? css`box-shadow: 0 0 0 3px #ddd;`+'cve': 'cv'
    // }
    return (
      <a
        {...attributes}
        href={link}
        className={
          (selected? css`box-shadow: 0 0 0 3px #ddd;`+' '+cssName: cssName)
        }
      >
        <SlateFun.InlineChromiumBugfix />
        {children}
        <SlateFun.InlineChromiumBugfix />
      </a>
    )
  },

  InlineChromiumBugfix : () => (
    <span
      contentEditable={false}
      className={css`
        font-size: 0;
      `}
    >
      ${String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  ),
  setLinkFormat:(editor:any,style:string,format?:string,value?:any)  => {
    let defalutUrl:any=SlateFun.getLinkSetting(editor)
    let newLink:any=JSON.parse(JSON.stringify(defalutUrl))
    if(newLink!==''){
      if(style=='button'){
        let size=format==='size'?value:(newLink.styleConfig.style=='none'?'small':newLink.styleConfig.setting.size)
        let variant=format==='variant'?value:(newLink.styleConfig.style=='none'?'outlined':newLink.styleConfig.setting.variant)
        newLink.styleConfig={
          style:style,
          setting:{
            size:size?size:'small',
            variant:variant?variant:'outlined'
          }
        }
      }else{
        newLink.styleConfig={style:'none'}
      }
    }

    const { selection } = editor
    const isCollapsed = selection && SlateRange.isCollapsed(selection)
   
    if(isCollapsed){
      let links=SlateFun.getLinkSetting(editor,1)
      Transforms.select(editor,links)
      // SlateFun.isButtonCollapsed=true;
      // const domSelection = window.getSelection()
      // if(domSelection||domSelection!.anchorNode){
      //   const domRange = domSelection!.getRangeAt(0)
      //   var strongs = domSelection!.anchorNode!.parentNode;
       
      //   if(domSelection!.rangeCount > 0) domSelection!.removeAllRanges();
      //   if(strongs){
      //     var range:any = document.createRange();
      //     range.selectNode(strongs);
      //     setTimeout(()=>{
      //        domSelection!.addRange(range);
      //      },10)
      //   }
        
      // }
    }
    // setTimeout(()=>{
      SlateFun.wrapLink(editor,newLink,newLink.source.sourceType,newLink.styleConfig.style,newLink);
    // },200)
  },
  //image
  InsertImageButtonFun:(event:any,editor:any)=>{
    event.preventDefault()
    const url = window.prompt('Enter the URL of the image:')
    if (url && !SlateFun.isImageUrl(url)) {
      // alert('URL is not an image')
      return
    }
    url && SlateFun.insertImage(editor, url)
  },
  isImageUrl: (url:any) => {
    if (!url) return false
    if (!isUrl(url)) return false
    const ext:any = new URL(url).pathname.split('.').pop()
    return imageExtensions.includes(ext)
  },
  insertImage: (editor:any, url:any,type?:string) => {
    const text = { text: '' }
    let imgUrl= type==='select'?url.id:url
    let source = type==='select'?{
      sourceType:'select',
      sourceData:url
    }:{sourceType:'input'}
    const image:any = { type: 'image', url:imgUrl, children: [text],source:source}
    Transforms.insertNodes(editor, image)
  },
  ImageComponent: ({ attributes, children, element }:any) => {
    const editor:any = useSlateStatic()
    const path:any = ReactEditor.findPath(editor, element)
    const selected = useSelected()
    const focused = useFocused()
    let link= element.source.sourceType==='select'?'{image:'+element.url+'}':element.url
    return (
      <div {...attributes}>
        {children}
        <div
          contentEditable={false}
          className={css`
            position: relative;
          `}
        >
          <img
            src={link}
            className={css`
              display: block;
              max-width: 100%;
              max-height: 20em;
              box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
            `}
          />
          
            <Delete  onClick={() => Transforms.removeNodes(editor, { at: path })} className={css`
              display: ${selected && focused ? 'inline!important' : 'none!important'};
              position: absolute!important;
              top: 0.5em!important;
              left: 0.5em!important;
              background-color: white!important;
            `}/>
        </div>
      </div>
    )
  },
  //button
  ButtonComponent:({ attributes, children,element }:any) => {
    return (
      <Button
        color='success'
        size={element.hasOwnProperty('setting')?element.setting.size:'small'} 
        variant={element.hasOwnProperty('setting')?element.setting.variant:'outlined'}
        {...attributes}
        onClick={ev => ev.preventDefault()}
        className={css`
          margin: 0 0.1em;
          background-color: #efefef;
          padding: 2px 6px;
          border: 1px solid #767676;
          border-radius: 2px;
          font-size: 0.9em;
        `}
      >
        <SlateFun.InlineChromiumBugfix />
        {children}
        <SlateFun.InlineChromiumBugfix />
      </Button>
    )
  },
  unwrapButton:(editor:any) => {
    Transforms.unwrapNodes(editor, {
      match: (n:any) =>n.type === 'button'&&!Editor.isEditor(n) && SlateElement.isElement(n),
    })
  },
  isButtonActive:(editor:any) => {
    const [button] = Editor.nodes(editor, {
      match: (n:any) =>n.type === 'button'&&!Editor.isEditor(n) && SlateElement.isElement(n),
    })
    return !!button
  },
  insertButton:(editor:any)  => {
    if (editor.selection) {
      SlateFun.wrapButton(editor)
    }
  },
  setButtonFormat:(editor:any,newButton?:any,type?:any)  => {
  
    const { selection } = editor
    const isCollapsed = selection && SlateRange.isCollapsed(selection)
    const button:any = newButton?newButton:{
      type: 'button',
      children: isCollapsed ? [{ text: 'Edit me!' }] : [],
    }
    if(isCollapsed){
      SlateFun.isButtonCollapsed=true;
      const domSelection = window.getSelection()
      if(domSelection||domSelection!.anchorNode){
        const domRange = domSelection!.getRangeAt(0)
        var strongs = domSelection!.anchorNode!.parentNode;
       
        if(domSelection!.rangeCount > 0) domSelection!.removeAllRanges();
        if(strongs){
          var range:any = document.createRange();
          range.selectNode(strongs);
          setTimeout(()=>{
          domSelection!.addRange(range);
        },10)
        }
        
      }
    }
      setTimeout(()=>{
      SlateFun.wrapButton(editor,newButton,type)
      },200)
  },
  wrapButton:(editor:any,newButton?:any,type?:any)  => {
    SlateFun.isButtonCollapsed=false;
    if(type==='none'){
      if (SlateFun.isButtonActive(editor)) {
        SlateFun.unwrapButton(editor)
      }
    }else{
      const { selection } = editor
      const isCollapsed = selection && SlateRange.isCollapsed(selection)
      const button:any = newButton?newButton:{
        type: 'button',
        children: isCollapsed ? [{ text: 'Edit me!' }] : [],
      }
      if (isCollapsed) {
        return;
        // Transforms.insertNodes(editor, button)
      } else {
        if (SlateFun.isButtonActive(editor)) {
          SlateFun.unwrapButton(editor)
        }
        Transforms.wrapNodes(editor, button, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
      }
    }
    ReactEditor.focus(editor)
  },
  wrapButtonOld:(editor:any,newButton?:any,type?:any)  => {
    SlateFun.isButtonCollapsed=false;
    if(type==='none'){
      if (SlateFun.isButtonActive(editor)) {
        SlateFun.unwrapButton(editor)
      }
    }else{
      const { selection } = editor
      const isCollapsed = selection && SlateRange.isCollapsed(selection)
      const button:any = newButton?newButton:{
        type: 'button',
        children: isCollapsed ? [{ text: 'Edit me!' }] : [],
      }
      if (isCollapsed) {
        return;
        // Transforms.insertNodes(editor, button)
      } else {
        if (SlateFun.isButtonActive(editor)) {
          SlateFun.unwrapButton(editor)
        }
        Transforms.wrapNodes(editor, button, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
      }
    }
    ReactEditor.focus(editor)
  },
  toggleButtonFormat : (editor:any, format:string,value?:any) => {
    if(SlateFun.isButtonActive(editor)){
      const [button] = Editor.nodes(editor, {
        match: (n:any) =>n.type === 'button'&&!Editor.isEditor(n) && SlateElement.isElement(n),
      })
      let newButton:any=JSON.parse(JSON.stringify(button[0]))
      if(!newButton.hasOwnProperty('setting')){
        let setting:any={
          size:'small',
          variant:'outlined'
        }
        newButton.setting=setting
      }
      newButton.setting[format]=value
      // SlateFun.wrapButton(editor,newButton?newButton:null)
      SlateFun.setButtonFormat(editor,newButton?newButton:null)
      
    }
   
  },
  getbuttonSetting:(editor:any)=>{
      const [button] = Editor.nodes(editor, {
        match: (n:any) =>n.type === 'button'&&!Editor.isEditor(n) && SlateElement.isElement(n),
      })
      return button[0]
  },
  isCollapsed:(editor:any)=>{
    const { selection } = editor
    const  isCollapsed= selection && SlateRange.isCollapsed(selection)
    return isCollapsed
  },
  clearFormat:(editor:any)=>{
    // console.log(Editor)
    // console.log(editor)
    // console.log(Text)
    // let [link]=Editor.nodes(editor,{
    //   mode:'all',
    //   match: (n:any) =>n.type === 'link'&& 
    //   !Editor.isEditor(n) && SlateElement.isElement(n)
    // })
    // console.log(link)
    // let TEXT_FORMAT_TYPES_s=SlateFun.TEXT_FORMAT_TYPES.map(item=>item!='link')
    // Transforms.unsetNodes(editor,['bold'],
    //   { match:(n:any) =>SlateFun.TEXT_FORMAT_TYPES_s.includes(n[.type]), 
    //     split: true,
    //     mode:'all'
    //   }
    // )
    // Transforms.unwrapNodes(editor, {
    //   match: (n:any) =>SlateFun.LIST_TYPES.includes(n.type)&&
    //     !Editor.isEditor(n) &&
    //     SlateElement.isElement(n) ,
    //   split: true,
    // })
  }

}

