import{j as t,d as l,e as c}from"./vendor-CvwO30Kb.js";import{D as p,H as m,K as u,a as f,C as g,R as x}from"./components-Dq7Sb9M9.js";import"./vendor-misc-Ci6Odffn.js";import"./charts-BMOWtbaq.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function s(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(e){if(e.ep)return;e.ep=!0;const o=s(e);fetch(e.href,o)}})();const h=()=>t.jsxs(t.Fragment,{children:[t.jsx(p,{}),t.jsxs("main",{className:"flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative",children:[t.jsx(m,{}),t.jsxs("div",{className:"flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth",children:[t.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8",children:u.map((i,r)=>t.jsx(f,{data:i},r))}),t.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-3 gap-6",children:[t.jsx(g,{}),t.jsx(x,{})]})]})]})]});function d(){try{const i=document.getElementById("root");if(!i)throw new Error("Could not find root element to mount to");l.createRoot(i).render(t.jsx(c.StrictMode,{children:t.jsx(h,{})})),setTimeout(()=>{document.querySelector(".app-loading")&&document.querySelector("[data-reactroot]")},1e3)}catch(i){const r=document.getElementById("root");r&&(r.innerHTML=`
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-align: center; font-family: system-ui;">
          <div>
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h1 style="font-size: 24px; margin-bottom: 10px;">React App Failed to Load</h1>
            <p style="opacity: 0.9; margin-bottom: 20px;">Error: ${i.message}</p>
            <button onclick="location.reload()" style="margin-top:20px; padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">
              Refresh Page
            </button>
            <br/>
            <button onclick="window.location.href='/simple'" style="margin-top:10px; padding:8px 16px; background:transparent; color:white; border:1px solid white; border-radius:6px; cursor:pointer; font-size:14px;">
              Simple Version
            </button>
          </div>
        </div>
      `)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d();
