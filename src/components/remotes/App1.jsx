import React, { useEffect, useRef, useState } from "react";

// import { mount as app1Mount } from "app1/bootloader";
import {mount as app1Mount} from 'app1/bootloader';

export default () => {
    // const ref = useRef(null);

    // useEffect(() => {
    //     console.log("loading APP1");
    //     mount(ref.current);
    // }, []);

    return <div ref={app1Mount} />;
}