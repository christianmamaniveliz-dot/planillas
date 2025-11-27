
// Simple PWA demo logic using localStorage
const LS = {
  personal: 'demo_personal_v1',
  registros: 'demo_registros_v1'
};

function $(id){return document.getElementById(id)}
function loadPersonal(){return JSON.parse(localStorage.getItem(LS.personal)||'[]')}
function savePersonal(list){localStorage.setItem(LS.personal, JSON.stringify(list))}
function loadRegistros(){return JSON.parse(localStorage.getItem(LS.registros)||'[]')}
function saveRegistros(list){localStorage.setItem(LS.registros, JSON.stringify(list))}

document.addEventListener('DOMContentLoaded', ()=>{
  // menu buttons
  $('btn-personal').onclick = ()=>showPanel('panel-personal')
  $('btn-registro').onclick = ()=>showPanel('panel-registro')
  $('btn-preview').onclick = ()=>{showPanel('panel-preview'); renderPreview()}
  $('btn-duplicar').onclick = ()=>{duplicarDiaAnterior(); alert('Duplicado (demo) cargado para la fecha seleccionada')}

  // personal form
  $('form-personal').onsubmit = (e)=>{e.preventDefault(); addPersonal(); return false}
  $('r-fecha').valueAsDate = new Date()

  renderPersonal()
  renderTrabajadores()
});

// panels
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'))
  $(id).classList.remove('hidden')
}

// personal
function addPersonal(){
  const nombre = $('p-nombre').value.trim()
  const ci = $('p-ci').value.trim()
  const cargo = $('p-cargo').value.trim()
  if(!nombre||!ci){alert('Nombre y CI requeridos'); return}
  const list = loadPersonal()
  list.push({id:Date.now(),nombre,ci,cargo,empresa:'Steelweld'})
  savePersonal(list)
  $('form-personal').reset()
  renderPersonal()
  renderTrabajadores()
}
function renderPersonal(){
  const list = loadPersonal()
  const cont = $('lista-personal'); cont.innerHTML=''
  if(list.length===0){cont.innerHTML='<p>No hay personal registrado.</p>'; return}
  list.forEach(p=>{
    const d = document.createElement('div'); d.className='item'
    d.innerHTML = `<div style="flex:1"><strong>${p.nombre}</strong><br><small>CI: ${p.ci} · ${p.cargo||'--'}</small></div>
    <div><button onclick="borrarPersonal(${p.id})" class="small">Eliminar</button></div>`
    cont.appendChild(d)
  })
}
function borrarPersonal(id){
  let list=loadPersonal(); list=list.filter(x=>x.id!==id); savePersonal(list); renderPersonal(); renderTrabajadores()
}

// trabajadores list for daily record
function renderTrabajadores(){
  const list = loadPersonal()
  const cont = $('lista-trabajadores'); cont.innerHTML=''
  if(list.length===0){cont.innerHTML='<p>Agrega personal en "Registrar Personal".</p>'; return}
  list.forEach(p=>{
    const d = document.createElement('div'); d.className='item'
    d.innerHTML = `<label style="flex:1"><input type="checkbox" data-id="${p.id}" /> <strong>${p.nombre}</strong><br><small>CI: ${p.ci} · ${p.cargo||'--'}</small></label>
    <div><input type="time" data-in="${p.id}" /></div>
    <div><input type="time" data-out="${p.id}" /></div>`
    cont.appendChild(d)
  })
}

// guardar registro diario
$('guardar-registro')?.addEventListener('click', ()=>{
  const fecha = $('r-fecha').value
  if(!fecha){alert('Selecciona fecha'); return}
  const seccion = $('r-seccion').value
  const feriado = $('r-feriado').checked
  const checked = Array.from(document.querySelectorAll('#lista-trabajadores input[type="checkbox"]:checked')).map(cb=>cb.getAttribute('data-id'))
  if(checked.length===0){alert('Selecciona al menos un trabajador'); return}
  const personal = loadPersonal()
  const registros = loadRegistros()
  checked.forEach(id=>{
    const p = personal.find(x=>String(x.id)===String(id))
    if(!p) return
    const inEl = document.querySelector(`input[data-in="${id}"]`)
    const outEl = document.querySelector(`input[data-out="${id}"]`)
    registros.push({
      id: Date.now()+Math.random(),
      fecha, seccion, feriado,
      personal_id: p.id, nombre:p.nombre, ci:p.ci, cargo:p.cargo,
      ingreso: inEl?.value||'', salida: outEl?.value||'', supervisor:''
    })
  })
  saveRegistros(registros)
  alert('Registros guardados (demo).')
  renderPreview()
})

// preview
function renderPreview(){
  const registros = loadRegistros()
  const cont = $('preview-table'); cont.innerHTML=''
  if(registros.length===0){cont.innerHTML='<p>No hay registros guardados.</p>'; return}
  const tbl = document.createElement('table'); tbl.style.width='100%'; tbl.border=1
  const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Fecha</th><th>Sección</th><th>Nombre</th><th>CI</th><th>Cargo</th><th>Ingreso</th><th>Salida</th></tr>'
  tbl.appendChild(thead)
  const tbody = document.createElement('tbody')
  registros.forEach(r=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${r.fecha}</td><td>${r.seccion}</td><td>${r.nombre}</td><td>${r.ci}</td><td>${r.cargo||''}</td><td>${r.ingreso}</td><td>${r.salida}</td>`
    tbody.appendChild(tr)
  })
  tbl.appendChild(tbody); cont.appendChild(tbl)
}

// export CSV
$('export-csv')?.addEventListener('click', ()=>{
  const regs = loadRegistros()
  if(regs.length===0){alert('No hay registros'); return}
  const header = ['Fecha','Sección','Nombre','CI','Cargo','Ingreso','Salida']
  const lines = [header.join(',')]
  regs.forEach(r=>{ lines.push([r.fecha,r.seccion,r.nombre,r.ci,r.cargo||'',r.ingreso||'',r.salida||''].map(s=>`"${String(s).replace(/"/g,'""')}"`).join(',')) })
  const csv = lines.join('\n')
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download='registro_soboce_demo.csv'; a.click(); URL.revokeObjectURL(url)
})

// export JSON
$('export-json')?.addEventListener('click', ()=>{
  const data = loadRegistros()
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download='registros_demo.json'; a.click(); URL.revokeObjectURL(url)
})

// simulate send
$('send-demo')?.addEventListener('click', ()=>{
  alert('Simulación: Envío realizado. (En la versión real se adjuntaría Excel/PDF y se enviaría a Planificación).')
})

// duplicar día anterior (simple demo: copy last day's registros to selected date)
function duplicarDiaAnterior(){
  const regs = loadRegistros()
  if(regs.length===0){alert('No hay registros para duplicar'); return}
  const last = regs[regs.length-1]
  const fecha = $('r-fecha').value || new Date().toISOString().slice(0,10)
  const copy = {...last, id: Date.now()+Math.random(), fecha}
  regs.push(copy)
  saveRegistros(regs)
  renderPreview()
}
