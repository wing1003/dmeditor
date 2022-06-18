import { ReactElement, useState } from 'react';
import './Tab.css';



export const Tab = (props:{content:ReactElement})=>{
    const [active, setActive] = useState(0);

    const tabs = [{text:'Block', 
    content: props.content},
                    {text:'Layout', content: <div>
                    <label>Layout</label>
                                <hr />
        
            </div> }
                ]


    return (<div style={{height:'100vh', background:'#fcfcfc'}}>
        <div className='tab-header-container'>        
        {tabs.map((tab, index)=><div key={index} onClick={()=>setActive(index)} className={((index==active)?'active ':'')+'tab-header'}>{tab.text}</div>)}
        </div>
        <div>
        {tabs.map((tab, index)=><div key={index} className='tab-content'>{index==active&&<>{tab.content}</>}</div>)}
        </div>
    </div>)
}