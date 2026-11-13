(() => {
  if (window.__centralAgendaLoaded) return;
  window.__centralAgendaLoaded = true;

  const root = document.createElement("div");
  root.id = "central-agenda-host";
  root.style.cssText = "position:fixed;z-index:2147483646;right:18px;bottom:18px;font-family:Arial,sans-serif;pointer-events:none;"; 
  // Ajusta o ponto de ancoragem em celulares sem alterar a posição original no computador.
  if (window.matchMedia && window.matchMedia("(max-width: 600px)").matches) {
    root.style.right = "8px";
    root.style.bottom = "max(8px, env(safe-area-inset-bottom))";
  }
  document.documentElement.appendChild(root);
  const shadow = root.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      *{box-sizing:border-box}
      /* O contêiner transparente não bloqueia cliques no Roundcube; somente os controles visíveis recebem eventos. */
      .launcher,.panel{pointer-events:auto}
      .launcher{transform:translateX(-132px);border:0;border-radius:999px;background:#123b63;color:#fff;padding:13px 18px;font-weight:700;
        box-shadow:0 5px 22px #0003;cursor:pointer;font-size:14px}
      .panel{display:none;width:min(494px,calc(100vw - 28px));height:min(745px,calc(100vh - 36px));
        background:#f5f8fc;border:1px solid #d7e1ed;border-radius:16px;box-shadow:0 12px 40px #102a4338;
        overflow:hidden;margin-bottom:10px;color:#1c2c3c}
      .panel.open{display:flex;flex-direction:column}
      header{background:linear-gradient(135deg,#0d2f50 0%,#164b78 58%,#236b9d 100%);color:white;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;position:relative;box-shadow:0 5px 16px #0b274744,inset 0 1px 0 #ffffff30;z-index:1}
      header:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#6eb6e8,#ffffff88,#6eb6e8);opacity:.75;pointer-events:none}
      header strong{text-shadow:0 2px 4px #061b32a6}
      header small{text-shadow:0 1px 3px #061b3280}
      .head-actions{display:flex;align-items:center;gap:5px;flex-shrink:0}
      .head-actions button{border:1px solid #ffffff66;border-radius:7px;background:#ffffff18;color:white;padding:7px 8px;font-size:10px;font-weight:700;cursor:pointer}
      .head-actions button:hover{background:#ffffff30}
      header strong{font-size:16px;letter-spacing:.2px}
      header small{display:block;color:#d9e8f7;margin-top:4px;font-size:11px}
      .panel-footer{flex:0 0 auto;text-align:right;padding:9px 14px;background:#fff;border-top:1px solid #e0e7ef;color:#526a80;font-size:11px;font-style:italic;font-weight:700;letter-spacing:.25px}
      .close{background:transparent;border:0;color:white;font-size:23px;cursor:pointer;padding:0 3px}
      nav{display:flex;flex-wrap:wrap;gap:5px;padding:7px 7px 8px;background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);border-bottom:1px solid #dce6f0;box-shadow:0 3px 9px #173b5c12}
      nav button{flex:1 1 30%;min-height:34px;padding:9px 6px;border:1px solid transparent;border-radius:7px;background:#f8fafc;color:#31516f;font-weight:700;font-size:11px;cursor:pointer;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease,transform .16s ease}
      nav button:hover{background:#edf5fc;border-color:#d5e4f2;box-shadow:0 2px 6px #173b5c18;transform:translateY(-1px)}
      nav button.active{color:#123b63;background:linear-gradient(180deg,#e8f3fc 0%,#dcecf9 100%);border-color:#a9c9e5;box-shadow:0 2px 7px #1b5b8d24,inset 0 1px 0 #ffffff;border-bottom:2px solid #2e7fc1}

      main{padding:14px;overflow:auto;flex:1}
      .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:13px}
      .stat{background:white;border:1px solid #e2eaf2;border-radius:10px;padding:10px}
      .stat b{display:block;font-size:20px;color:#123b63}
      .stat span{font-size:10px;color:#64788c}
      .toolbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px}
      h3{font-size:14px;margin:0;color:#193c5d}
      button.primary{background:#1769a6;color:white;border:0;border-radius:8px;padding:9px 12px;font-weight:700;cursor:pointer}
      button.secondary{background:white;color:#234b70;border:1px solid #cbd9e6;border-radius:8px;padding:8px 10px;cursor:pointer}
      .item{background:linear-gradient(135deg,#ffffff 0%,#fbfdff 100%);border:1px solid #dce6f0;border-left:4px solid #e0a52b;border-radius:10px;padding:11px;margin:9px 0;box-shadow:0 2px 7px #173b5c10;transition:box-shadow .16s ease,border-color .16s ease,transform .16s ease}
      .item:hover{box-shadow:0 4px 12px #173b5c1b;border-color:#cbdbea;transform:translateY(-1px)}
      .swap-name-highlight{font-size:1em;font-weight:800;color:#123b63;line-height:1.5;display:inline-block;margin:2px 0}
      .item.today{border-left-color:#c73c3c}.item.done{border-left-color:#3c9b69;opacity:.72}.item.vacation{border-left-color:#8056b3;background:#fbf8ff}.item.vacation-return{border-left-color:#168b78;background:#f3fbf9}.item.recycling{border-left-color:#c17a27;background:#fffaf3}.item.aso{border-left-color:#287f91;background:#f2fbfc}.item.absence{border-left-color:#b65b72;background:#fff9fb}
      .item h4{margin:0 0 5px;font-size:13px;color:#173b5c}
      .meta{font-size:11px;color:#64788c;line-height:1.6}
      .actions{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
      .actions button{font-size:11px;padding:6px 8px}
      .empty{padding:28px 12px;text-align:center;color:#73869a;font-size:13px}
      form{background:white;border:1px solid #e0e8f0;border-radius:11px;padding:12px;margin-bottom:12px}
      label{display:block;font-size:11px;font-weight:700;color:#526a80;margin:8px 0 4px}
      input,textarea,select{width:100%;border:1px solid #cbd8e5;border-radius:7px;padding:9px;font:12px Arial;color:#20384d;background:#fff}
      textarea{resize:vertical;min-height:55px}
      .formrow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .formbuttons{display:flex;gap:8px;margin-top:10px}
      .hint{font-size:10px;color:#74879a;line-height:1.5;margin-top:10px}
      .filter{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
      .filter button{font-size:11px}
      @media(max-width:600px){
        .launcher{transform:none;min-height:46px;padding:12px 16px;font-size:14px;touch-action:manipulation}
        .panel{width:calc(100vw - 16px);height:calc(100dvh - 16px);max-height:calc(100dvh - 16px);
          border-radius:13px;margin-bottom:8px}
        header{padding:10px 10px;gap:6px}
        header strong{font-size:14px}
        header small{font-size:10px}
        .head-actions{gap:4px}
        .head-actions button{min-height:38px;padding:7px 6px;font-size:10px}
        .close{min-width:36px;min-height:40px;font-size:25px}
        nav{gap:5px;padding:7px}
        nav button{flex:1 1 30%;min-height:42px;padding:8px 4px;font-size:11px;touch-action:manipulation}
        main{padding:10px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
        .summary{gap:5px}
        .stat{padding:8px 6px}
        .stat b{font-size:18px}
        .toolbar{align-items:flex-start}
        button.primary,button.secondary,.actions button,.filter button{min-height:40px;touch-action:manipulation}
        input,textarea,select{font-size:16px;min-height:42px}
        textarea{min-height:72px}
        .formrow{grid-template-columns:1fr;gap:2px}
        form{padding:10px}
        .item{padding:10px}
        .actions{gap:7px}
        .actions button{padding:8px 10px}
        .panel-footer{padding:8px 10px}
      }
      @media(max-width:360px){
        header strong{font-size:12px}
        .head-actions button{font-size:9px;padding:6px 4px}
        nav button{font-size:10px}
        .summary{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-height:520px) and (max-width:900px){
        .panel{height:calc(100dvh - 12px);max-height:calc(100dvh - 12px)}
        header{padding:6px 9px}
        nav{padding:4px}
        nav button{min-height:34px}
        .panel-footer{padding:5px 8px}
      }
    </style>
    <button class="launcher" id="launch">📅 Agendamentos</button>
    <section class="panel" id="panel" aria-label="Central de Agendamentos">
      <header><div><strong>Central de Agendamentos</strong><small>Seu painel independente do webmail</small></div><div class="head-actions"><button id="backupBtn" title="Baixar cópia de segurança">⬇ Backup</button><button id="importBtn" title="Restaurar uma cópia de segurança">⬆ Importar</button><input id="backupFile" type="file" accept=".json,application/json" hidden><button class="close" id="close" aria-label="Fechar">×</button></div></header>
      <nav><button id="agendaTab" class="active">▦ Agendamentos</button><button id="swapTab">🔄 Troca de Folga</button><button id="recyclingTab">♻ Reciclagem</button><button id="vacationTab">🏖 Férias</button><button id="asoTab">🩺 Exame ASO</button><button id="absenceTab">🩹 Atestado/Afastamento</button><button id="otherTab">📌 Outros Agendamentos</button></nav>
      <main id="content"></main>
      <footer class="panel-footer">Desenvolvedor: Rubens Gilson</footer>
    </section>
  `;

  // Impede que atalhos de teclado do Roundcube interceptem a digitação no painel.
  // Não cancela a ação padrão: espaços, seleção e movimentação do cursor continuam normais.
  ["keydown", "keypress", "keyup"].forEach((type) => {
    shadow.addEventListener(type, (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable) {
        event.stopPropagation();
      }
    }, true);
  });

  const $ = (id) => shadow.getElementById(id);
  let appointments = [];
  let vacations = [];
  let recyclings = [];
  let asos = [];
  let absences = [];
  let swapDays = [];
  let otherAppointments = [];
  let editingOtherId = null;
  let editingSwapId = null;
  let editingId = null;
  let filter = "todos";

  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  async function load() {
    const data = await chrome.storage.local.get(["appointments", "vacations", "recyclings", "asos", "absences", "swapDays", "otherAppointments"]);
    appointments = Array.isArray(data.appointments) ? data.appointments : [];
    vacations = Array.isArray(data.vacations) ? data.vacations : [];
    recyclings = Array.isArray(data.recyclings) ? data.recyclings : [];
    asos = Array.isArray(data.asos) ? data.asos : [];
    absences = Array.isArray(data.absences) ? data.absences : [];
    swapDays = Array.isArray(data.swapDays) ? data.swapDays : [];
    otherAppointments = Array.isArray(data.otherAppointments) ? data.otherAppointments : [];
    renderAgenda();
  }

  async function save() {
    await chrome.storage.local.set({ appointments, vacations, recyclings, asos, absences, swapDays, otherAppointments });
    await load();
  }

  function dateLabel(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "Data não definida" :
      d.toLocaleString("pt-BR", { dateStyle:"short", timeStyle:"short" });
  }

  function recyclingEndDate(startDate) {
    if (!startDate) return "";
    const [year, month, day] = startDate.split("-").map(Number);
    const end = new Date(year, month - 1, day + 4); // 5 dias corridos, contando o primeiro dia
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  }

  function isPastDate(value) {
    if (!value) return false;
    const d = new Date(value.length === 10 ? value + "T00:00:00" : value);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    return d < today;
  }

  function ongoingMarkup(value) {
    return isPastDate(value) ? ' · <strong>Em Andamento</strong>' : "";
  }

  function recyclingOngoing(r) {
    if (!r.date) return false;
    const endValue = r.endDate || recyclingEndDate(r.date);
    const [sy,sm,sd] = r.date.split("-").map(Number);
    const [ey,em,ed] = endValue.split("-").map(Number);
    const start = new Date(sy,sm-1,sd), end = new Date(ey,em-1,ed), today = new Date();
    today.setHours(0,0,0,0);
    return today >= start && today <= end;
  }

  function daysLabel(value) {
    const d = new Date(value);
    const today = new Date();
    const a = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const b = new Date(d.getFullYear(),d.getMonth(),d.getDate());
    const n = Math.round((b-a)/86400000);
    if (n < 0) return "Em Andamento";
    if (n === 0) return "Hoje";
    if (n === 1) return "Amanhã";
    return `Em ${n} dias`;
  }

  function showTab(tab) {
    if (tab === "agenda") filter = "todos";
    $("agendaTab").classList.toggle("active", tab === "agenda");
    $("absenceTab").classList.toggle("active", tab === "absences");
    $("vacationTab").classList.toggle("active", tab === "vacations");
    $("recyclingTab").classList.toggle("active", tab === "recycling");
    $("asoTab").classList.toggle("active", tab === "aso");
    $("swapTab").classList.toggle("active", tab === "swapDays");
    $("otherTab").classList.toggle("active", tab === "otherAppointments");
    if (tab === "absences") renderAbsences();
    else if (tab === "vacations") renderVacations();
    else if (tab === "recycling") renderRecyclings();
    else if (tab === "aso") renderAsos();
    else if (tab === "swapDays") renderSwapDays();
    else if (tab === "otherAppointments") renderOtherAppointments();
    else renderAgenda();
  }

  function renderAgenda() {
    const now = new Date();
    const today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    // Os indicadores consideram todos os tipos de evento da agenda.
    // Férias geram dois marcos (saída e retorno); reciclagens geram um marco.
    // Eventos de férias já ocorridos são históricos, não ficam como atrasados.
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const activeAppointments = appointments
      .filter(a => a.status !== "concluido" && a.datetime)
      .map(a => new Date(a.datetime)).filter(d => !Number.isNaN(d.getTime()));
    const vacationDates = vacations.flatMap(v => {
      if (!v.startDate) return [];
      const [y,m,d] = v.startDate.split("-").map(Number);
      const start = new Date(y,m-1,d);
      if (Number.isNaN(start.getTime())) return [];
      return [start, new Date(y,m-1,d+Number(v.days || 30))];
    });
    const recyclingDates = recyclings.map(r => {
      if (!r.date) return null;
      const [y,m,d] = r.date.split("-").map(Number);
      const date = new Date(y,m-1,d);
      return Number.isNaN(date.getTime()) ? null : date;
    }).filter(Boolean);
    const asoDates = asos.flatMap(a => [a.programmedDate, a.deadlineDate].filter(Boolean).map(value => {
      const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d);
    })).filter(d => !Number.isNaN(d.getTime()));
    const swapDates = swapDays.flatMap(item => [item.dayOff, item.dayWork].filter(Boolean).map(value => {
      const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d);
    })).filter(d => !Number.isNaN(d.getTime()));
    const otherDates = otherAppointments.map(a => a.datetime ? new Date(a.datetime) : null).filter(d => d && !Number.isNaN(d.getTime()));
    const allCurrentEvents = [...activeAppointments, ...vacationDates, ...recyclingDates, ...asoDates, ...swapDates, ...otherDates];
    const todayCount = allCurrentEvents.filter(d => sameDay(d, today)).length;
    const upcoming = allCurrentEvents.filter(d => {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return day > today;
    }).length;
    // Em Andamento: compromissos/itens vencidos ainda pendentes, reciclagens
    // em curso e férias cujo período já começou e ainda não terminou.
    // Saídas/retornos de férias passados fora do período são históricos.
    const activeVacations = vacations.filter(v => {
      if (!v.startDate) return false;
      const [sy, sm, sd] = v.startDate.split("-").map(Number);
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(sy, sm - 1, sd + Number(v.days || 30));
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) &&
        today >= start && today < end;
    }).length;
    const overdue = [...activeAppointments, ...recyclingDates, ...asoDates, ...swapDates].filter(d => {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return day < today;
    }).length + activeVacations;

    const filteredAppointments = appointments.filter(a => {
      const d = new Date(a.datetime);
      if (filter === "hoje") return d.toDateString() === today.toDateString() && a.status !== "concluido";
      if (filter === "3dias") return d >= today && d < new Date(today.getTime()+3*86400000) && a.status !== "concluido";
      if (filter === "7dias") return d >= today && d < new Date(today.getTime()+7*86400000) && a.status !== "concluido";
      if (filter === "pendentes") return a.status !== "concluido";
      if (filter === "concluidos") return a.status === "concluido";
      return true;
    }).map(a => ({ kind:"appointment", date:new Date(a.datetime), data:a }));
    const vacationEntries = vacations.flatMap(v => {
      if (!v.startDate) return [];
      const [y,m,d] = v.startDate.split("-").map(Number);
      const startDate = new Date(y,m-1,d);
      const returnDate = new Date(y,m-1,d+Number(v.days||30));
      const matches = date => filter === "todos" ||
        (filter === "hoje" && date.toDateString() === today.toDateString()) ||
        (filter === "3dias" && date >= today && date < new Date(today.getTime()+3*86400000)) ||
        (filter === "7dias" && date >= today && date < new Date(today.getTime()+7*86400000)) ||
        (filter === "pendentes" && date >= today) ||
        (filter === "concluidos" && date < today);
      const entries = [];
      if (matches(startDate)) entries.push({kind:"vacation",date:startDate,data:v});
      if (matches(returnDate)) entries.push({kind:"vacation-return",date:returnDate,data:v});
      return entries;
    });
    const recyclingEntries = recyclings.flatMap(r => {
      if (!r.date) return [];
      const [y,m,d] = r.date.split("-").map(Number);
      const date = new Date(y,m-1,d);
      const matches = filter === "todos" ||
        (filter === "hoje" && date.toDateString() === today.toDateString()) ||
        (filter === "3dias" && date >= today && date < new Date(today.getTime()+3*86400000)) ||
        (filter === "7dias" && date >= today && date < new Date(today.getTime()+7*86400000)) ||
        (filter === "pendentes" && date >= today) ||
        (filter === "concluidos" && date < today);
      return matches ? [{kind:"recycling",date,data:r}] : [];
    });
    const asoEntries = asos.flatMap(a => {
      const entries = [];
      for (const [field, kind] of [["programmedDate","aso-programmed"],["deadlineDate","aso-deadline"]]) {
        if (!a[field]) continue;
        const [y,m,d] = a[field].split("-").map(Number);
        const date = new Date(y,m-1,d);
        const matches = filter === "todos" ||
          (filter === "hoje" && date.toDateString() === today.toDateString()) ||
          (filter === "3dias" && date >= today && date < new Date(today.getTime()+3*86400000)) ||
          (filter === "7dias" && date >= today && date < new Date(today.getTime()+7*86400000)) ||
          (filter === "pendentes" && date >= today) || (filter === "concluidos" && date < today);
        if (matches && !Number.isNaN(date.getTime())) entries.push({kind,date,data:a});
      }
      return entries;
    });
    const swapEntries = swapDays.flatMap(item => [
      ["dayOff", "swap-dayoff"], ["dayWork", "swap-daywork"]
    ].flatMap(([field, kind]) => {
      const value = item[field];
      if (!value) return [];
      const [y,m,d] = value.split("-").map(Number);
      const date = new Date(y,m-1,d);
      const matches = filter === "todos" ||
        (filter === "hoje" && date.toDateString() === today.toDateString()) ||
        (filter === "3dias" && date >= today && date < new Date(today.getTime()+3*86400000)) ||
        (filter === "7dias" && date >= today && date < new Date(today.getTime()+7*86400000)) ||
        (filter === "pendentes" && date >= today) ||
        (filter === "concluidos" && date < today);
      return matches && !Number.isNaN(date.getTime()) ? [{kind,date,data:item}] : [];
    }));
    const otherEntries = otherAppointments.flatMap(item => {
      if (!item.datetime) return [];
      const date = new Date(item.datetime);
      if (Number.isNaN(date.getTime())) return [];
      const matches = filter === "todos" || (filter === "hoje" && date.toDateString() === today.toDateString()) ||
        (filter === "3dias" && date >= today && date < new Date(today.getTime()+3*86400000)) ||
        (filter === "7dias" && date >= today && date < new Date(today.getTime()+7*86400000)) ||
        (filter === "pendentes" && date >= today) || (filter === "concluidos" && date < today);
      return matches ? [{kind:"other-appointment",date,data:item}] : [];
    });
    const timeline = [...filteredAppointments,...vacationEntries,...recyclingEntries,...asoEntries,...swapEntries,...otherEntries].sort((a,b)=>a.date-b.date);

    $("content").innerHTML = `
      <div class="summary">
        <div class="stat"><b>${todayCount}</b><span>Hoje</span></div>
        <div class="stat"><b>${upcoming}</b><span>Próximos</span></div>
        <div class="stat"><b>${overdue}</b><span>Em Andamento</span></div>
      </div>
      <div class="toolbar"><h3>Atestados/Afastamentos, Férias, Reciclagens, ASO e Trocas de Folga</h3></div>
      <div class="filter">
        <button class="secondary" data-filter="todos">Todos</button>
        <button class="secondary" data-filter="hoje">Hoje</button>
        <button class="secondary" data-filter="3dias">3 dias</button>
        <button class="secondary" data-filter="7dias">7 dias</button>
        <button class="secondary" data-filter="pendentes">Pendentes</button>
        <button class="secondary" data-filter="concluidos">Concluídos</button>
      </div>
      <div id="formSlot"></div>
      <div id="items">${timeline.length ? timeline.map(entry => {
        if (entry.kind === "vacation" || entry.kind === "vacation-return") {
          const v=entry.data, isReturn=entry.kind==="vacation-return";
          return `<article class="item ${isReturn?'vacation-return':'vacation'}">
            <h4>${isReturn?'🔔 Retorno de férias':'🏖 Início das férias'} — ${escapeHtml(v.name)}</h4>
            <div class="meta">📅 ${entry.date.toLocaleDateString("pt-BR")} · ${daysLabel(entry.date) === "Em Andamento" ? "<strong>Em Andamento</strong>" : daysLabel(entry.date)}<br>
            🏢 Posto de trabalho: ${escapeHtml(v.workPost||"Não informado")}<br>
            Período: ${v.days} dias${isReturn?' · Retorno previsto':''}</div>
            <div class="actions"><button class="secondary" data-vedit="${v.id}">Editar férias</button><button class="secondary" data-vdelete="${v.id}">Excluir férias</button></div>
          </article>`;
        }
        if (entry.kind === "recycling") {
          const r=entry.data;
          return `<article class="item recycling">
            <h4>♻ Reciclagem — ${escapeHtml(r.name)}</h4>
            <div class="meta">📅 Início: ${entry.date.toLocaleDateString("pt-BR")} · ${recyclingOngoing(r) ? '<strong>Em Andamento</strong>' : daysLabel(entry.date)}<br>
            🗓 Final da reciclagem: ${new Date((r.endDate || recyclingEndDate(r.date))+"T00:00:00").toLocaleDateString("pt-BR")}<br>
            🏢 Posto de trabalho: ${escapeHtml(r.workPost)}<br>
            Cobertura: ${escapeHtml(r.coverage)} · Modalidade: ${escapeHtml(r.type)}<br>${r.notes ? "Observações: "+escapeHtml(r.notes) : ""}</div>
            <div class="actions"><button class="secondary" data-redit="${r.id}">Editar reciclagem</button><button class="secondary" data-rdelete="${r.id}">Excluir reciclagem</button></div>
          </article>`;
        }
        if (entry.kind === "swap-dayoff" || entry.kind === "swap-daywork") {
          const item = entry.data;
          const isDayOff = entry.kind === "swap-dayoff";
          return `<article class="item" style="border-left-color:${item.decision === "Autorizado" ? "#3c9b69" : item.decision === "Não Autorizado" ? "#c73c3c" : "#e0a52b"}">
            <h4>🔄 Troca de folga — ${isDayOff ? "Dia que folgará" : "Dia que trabalhará"}</h4>
            <div class="meta">📅 ${entry.date.toLocaleDateString("pt-BR")} · ${daysLabel(entry.date) === "Em Andamento" ? "<strong>Em Andamento</strong>" : daysLabel(entry.date)}<br>
            🏢 Posto de trabalho: ${escapeHtml(item.workPost || "Não informado")}<br>
            <strong class="swap-name-highlight">Solicitante: ${escapeHtml(item.requester || "Não informado")}</strong><br>
            Dia que folgará: ${formatDateOnly(item.dayOff)}<br>
            Dia que trabalhará: ${formatDateOnly(item.dayWork)}<br>
            <strong class="swap-name-highlight">De Acordo: ${escapeHtml(item.agreedBy || "Não informado")}</strong><br>
            Dia que folgará: ${formatDateOnly(item.agreedDayOff)}<br>
            Dia que trabalhará: ${formatDateOnly(item.agreedDayWork)}<br>
            Autorização: <strong>${escapeHtml(item.decision || "Pendente")}</strong><br>
            ${item.notes ? "Observações: " + escapeHtml(item.notes) : ""}</div>
            <div class="actions"><button class="secondary" data-swapedit="${item.id}">Editar troca de folga</button><button class="secondary" data-swapdelete="${item.id}">Excluir troca de folga</button></div>
          </article>`;
        }
        if (entry.kind === "aso-programmed" || entry.kind === "aso-deadline") {
          const a = entry.data;
          const isDeadline = entry.kind === "aso-deadline";
          return `<article class="item aso">
            <h4>${isDeadline ? "⚠️ Data limite do exame ASO" : "🩺 Exame ASO programado"} — ${escapeHtml(a.name)}</h4>
            <div class="meta">📅 ${entry.date.toLocaleDateString("pt-BR")} · ${daysLabel(entry.date) === "Em Andamento" ? "<strong>Em Andamento</strong>" : daysLabel(entry.date)}<br>
            🏢 Posto: ${escapeHtml(a.workPost || "Não informado")}<br>
            Cobertura: ${escapeHtml(a.coverage || "Não informada")}<br>
            ${a.notes ? "Observações: " + escapeHtml(a.notes) : ""}</div>
            <div class="actions"><button class="secondary" data-asoedit="${a.id}">Editar ASO</button><button class="secondary" data-asodelete="${a.id}">Excluir ASO</button></div>
          </article>`;
        }
        if (entry.kind === "other-appointment") {
          const item = entry.data;
          return `<article class="item" style="border-left-color:#536fa8;background:#f8faff">
            <h4>📌 ${escapeHtml(item.title || "Novo compromisso")}</h4>
            <div class="meta">📅 ${dateLabel(item.datetime)} · ${daysLabel(entry.date) === "Em Andamento" ? "<strong>Em Andamento</strong>" : daysLabel(entry.date)}<br>
            ${item.location ? "📍 Local: "+escapeHtml(item.location)+"<br>" : ""}
            ${item.details ? "Detalhes: "+escapeHtml(item.details)+"<br>" : ""}
            ${item.notes ? "Observações: "+escapeHtml(item.notes) : ""}</div>
            <div class="actions"><button class="secondary" data-otheredit="${item.id}">Editar compromisso</button><button class="secondary" data-otherdelete="${item.id}">Excluir compromisso</button></div>
          </article>`;
        }
        const a=entry.data;
        return `<article class="item ${a.status === "concluido" ? "done" : (entry.date.toDateString() === today.toDateString() ? "today" : "")}">
          <h4>${escapeHtml(a.title)}</h4>
          <div class="meta">📅 ${dateLabel(a.datetime)} · ${daysLabel(a.datetime)}<br>
          ${a.location ? "📍 "+escapeHtml(a.location)+"<br>" : ""}
          ${a.responsible ? "Nome do agendado: "+escapeHtml(a.responsible)+"<br>" : ""}
          ${a.description ? escapeHtml(a.description)+"<br>" : ""}
          ${a.notes ? "Observações: "+escapeHtml(a.notes) : ""}</div>
          <div class="actions">${a.status !== "concluido" ? `<button class="secondary" data-done="${a.id}">Concluir</button>` : ""}
            <button class="secondary" data-edit="${a.id}">Editar</button><button class="secondary" data-delete="${a.id}">Excluir</button></div>
        </article>`;
      }).join("") : `<div class="empty">Nenhum compromisso, férias, reciclagem, exame ASO ou troca de folga nesta visualização.</div>`}</div>
      <p class="hint">A agenda reúne compromissos, férias, reciclagens, exames ASO e trocas de folga em ordem cronológica. Todos os registros podem ser editados ou excluídos diretamente nesta tela. Os dados ficam armazenados localmente no Chrome.</p>
    `;

    shadow.querySelectorAll("[data-otheredit]").forEach(b => b.addEventListener("click", () => {
      const selected = otherAppointments.find(x => String(x.id) === String(b.dataset.otheredit));
      if (!selected) return; showTab("otherAppointments"); showOtherAppointmentForm(selected);
    }));
    shadow.querySelectorAll("[data-otherdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este compromisso?")) { otherAppointments = otherAppointments.filter(x => String(x.id) !== String(b.dataset.otherdelete)); await save(); }
    }));
    shadow.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => { filter=b.dataset.filter; renderAgenda(); }));
    shadow.querySelectorAll("[data-vedit]").forEach(b => b.addEventListener("click", () => { showTab("vacations"); showVacationForm(vacations.find(v=>v.id===b.dataset.vedit)); }));
    shadow.querySelectorAll("[data-vdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este cadastro de férias?")) {
        vacations = vacations.filter(v => v.id !== b.dataset.vdelete);
        await save();
      }
    }));
    shadow.querySelectorAll("[data-redit]").forEach(b => b.addEventListener("click", () => { showTab("recycling"); showRecyclingForm(recyclings.find(r=>r.id===b.dataset.redit)); }));
    shadow.querySelectorAll("[data-rdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este cadastro de reciclagem?")) {
        recyclings = recyclings.filter(r => r.id !== b.dataset.rdelete);
        await save();
      }
    }));
    shadow.querySelectorAll("[data-asoedit]").forEach(b => b.addEventListener("click", () => {
      // Captura o cadastro antes de trocar de aba (a troca recria o DOM da agenda).
      const selectedAso = asos.find(a => String(a.id) === String(b.dataset.asoedit));
      if (!selectedAso) { alert("Não foi possível localizar este exame ASO. Atualize a agenda e tente novamente."); return; }
      showTab("aso");
      showAsoForm(selectedAso);
      $("asoFormSlot").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    shadow.querySelectorAll("[data-swapedit]").forEach(b => b.addEventListener("click", () => {
      const selected = swapDays.find(item => String(item.id) === String(b.dataset.swapedit));
      if (!selected) { alert("Não foi possível localizar esta troca de folga."); return; }
      showTab("swapDays");
      showSwapForm(selected);
      $("swapFormSlot").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    shadow.querySelectorAll("[data-swapdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir esta solicitação de troca de folga?")) {
        swapDays = swapDays.filter(item => String(item.id) !== String(b.dataset.swapdelete));
        await save();
      }
    }));
    shadow.querySelectorAll("[data-asodelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este exame ASO?")) {
        asos = asos.filter(a => a.id !== b.dataset.asodelete);
        await save();
      }
    }));
    shadow.querySelectorAll("[data-done]").forEach(b => b.addEventListener("click", async () => {
      const a=appointments.find(x=>x.id===b.dataset.done); if(a) a.status="concluido"; await save();
    }));
    shadow.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
      editingId=b.dataset.edit; showForm(appointments.find(x=>x.id===editingId));
    }));
    shadow.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", async () => {
      if(confirm("Deseja excluir este agendamento?")) { appointments=appointments.filter(x=>x.id!==b.dataset.delete); await save(); }
    }));
  }


  function calculateAbsenceReturn(startDate, periodDays) {
    if (!startDate || !Number.isInteger(Number(periodDays)) || Number(periodDays) < 1) return "";
    const [year, month, day] = startDate.split("-").map(Number);
    const result = new Date(year, month - 1, day + Number(periodDays));
    return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, "0")}-${String(result.getDate()).padStart(2, "0")}`;
  }

  function formatDateOnly(value) {
    if (!value) return "Não informada";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? "Data inválida" : date.toLocaleDateString("pt-BR");
  }

  function renderOtherAppointments() {
    const sorted = [...otherAppointments].sort((a,b) => String(a.datetime || "").localeCompare(String(b.datetime || "")));
    $("content").innerHTML = `<div class="toolbar"><h3>Outros Agendamentos</h3><button class="primary" id="newOtherAppointment">＋ Novo compromisso</button></div>
      <div id="otherAppointmentFormSlot"></div>
      ${sorted.length ? sorted.map(item => `<article class="item" style="border-left-color:#536fa8;background:#f8faff">
        <h4>📌 ${escapeHtml(item.title)}</h4><div class="meta">
        ${item.name ? "Nome: "+escapeHtml(item.name)+"<br>" : ""}📅 ${dateLabel(item.datetime)}${ongoingMarkup(item.datetime)}<br>
        ${item.location ? "📍 Local: "+escapeHtml(item.location)+"<br>" : ""}${item.details ? "Detalhes: "+escapeHtml(item.details)+"<br>" : ""}${item.notes ? "Observações: "+escapeHtml(item.notes) : ""}</div>
        <div class="actions"><button class="secondary" data-other-tab-edit="${item.id}">Editar</button><button class="secondary" data-other-tab-delete="${item.id}">Excluir</button></div></article>`).join("") : `<div class="empty">Nenhum outro compromisso cadastrado.</div>`}
      <p class="hint">Todos os compromissos cadastrados aqui também aparecem na aba Agendamentos, junto com os demais eventos, em ordem cronológica.</p>`;
    $("newOtherAppointment").addEventListener("click", () => showOtherAppointmentForm());
    shadow.querySelectorAll("[data-other-tab-edit]").forEach(b => b.addEventListener("click", () => showOtherAppointmentForm(otherAppointments.find(x => String(x.id) === String(b.dataset.otherTabEdit)))));
    shadow.querySelectorAll("[data-other-tab-delete]").forEach(b => b.addEventListener("click", async () => { if (confirm("Deseja excluir este compromisso?")) { otherAppointments = otherAppointments.filter(x => String(x.id) !== String(b.dataset.otherTabDelete)); await save(); showTab("otherAppointments"); } }));
  }

  function showOtherAppointmentForm(item = {}) {
    editingOtherId = item.id || null;
    const slot = $("otherAppointmentFormSlot");
    const localDateTime = item.datetime ? (() => { const d = new Date(item.datetime); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); })() : "";
    slot.innerHTML = `<form id="otherAppointmentForm"><h3>${item.id ? "Editar compromisso" : "Novo compromisso"}</h3>
      <label>Nome:</label><input name="name" value="${escapeHtml(item.name || "")}" placeholder="Nome">
      <label>Novo Compromisso</label><input name="title" required value="${escapeHtml(item.title || "")}" placeholder="Nome do compromisso">
      <div class="formrow"><div><label>Data</label><input name="date" type="date" required value="${localDateTime.slice(0,10)}"></div><div><label>Hora</label><input name="time" type="time" required value="${localDateTime.slice(11,16)}"></div></div>
      <label>Local do Compromisso</label><input name="location" value="${escapeHtml(item.location || "")}">
      <label>Detalhes do Compromisso</label><textarea name="details">${escapeHtml(item.details || "")}</textarea>
      <label>Observações</label><textarea name="notes">${escapeHtml(item.notes || "")}</textarea>
      <div class="formbuttons"><button class="primary" type="submit">Salvar</button><button class="secondary" type="button" id="cancelOtherAppointment">Cancelar</button></div></form>`;
    $("otherAppointmentForm").addEventListener("submit", async event => {
      event.preventDefault(); const f = new FormData(event.currentTarget); const date = f.get("date"), time = f.get("time");
      const obj = { id: editingOtherId || `other-${Date.now()}`, name: String(f.get("name") || "").trim(), title: String(f.get("title")).trim(), datetime: `${date}T${time}:00`, location: String(f.get("location") || "").trim(), details: String(f.get("details") || "").trim(), notes: String(f.get("notes") || "").trim() };
      if (editingOtherId) otherAppointments = otherAppointments.map(x => String(x.id) === String(editingOtherId) ? obj : x); else otherAppointments.push(obj);
      editingOtherId = null; await save(); showTab("otherAppointments");
    });
    $("cancelOtherAppointment").addEventListener("click", () => { editingOtherId = null; renderOtherAppointments(); });
    slot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderAbsences() {
    const sorted = [...absences].sort((a, b) => (a.certificateDate || "").localeCompare(b.certificateDate || ""));
    $("content").innerHTML = `
      <div class="toolbar"><h3>Controle de atestados e afastamentos</h3><button class="primary" id="newAbsence">＋ Novo registro</button></div>
      <div id="absenceFormSlot"></div>
      <div>${sorted.length ? sorted.map(a => `
        <article class="item" style="border-left-color:#b65b72;background:#fff9fb">
          <h4>🩹 ${escapeHtml(a.name)}</h4>
          <div class="meta">Data do atestado/afastamento: ${formatDateOnly(a.certificateDate)}<br>
          Período de afastamento: ${Number(a.periodDays)} dia(s)<br>
          Dia de retorno: <strong>${formatDateOnly(a.returnDate || calculateAbsenceReturn(a.certificateDate, a.periodDays))}</strong>${ongoingMarkup(a.certificateDate)}<br>
          ${a.notes ? `Observações: ${escapeHtml(a.notes)}` : ""}</div>
          <div class="actions"><button class="secondary" data-aedit="${a.id}">Editar</button><button class="secondary" data-adelete="${a.id}">Excluir</button></div>
        </article>`).join("") : `<div class="empty">Nenhum atestado ou afastamento cadastrado.</div>`}</div>
      <p class="hint">Informe a data do atestado e a quantidade de dias de afastamento. O dia de retorno é calculado automaticamente, considerando o retorno no dia seguinte ao término do período informado.</p>`;

    $("newAbsence").addEventListener("click", () => showAbsenceForm());
    shadow.querySelectorAll("[data-aedit]").forEach(button => button.addEventListener("click", () => showAbsenceForm(absences.find(a => a.id === button.dataset.aedit))));
    shadow.querySelectorAll("[data-adelete]").forEach(button => button.addEventListener("click", async () => {
      if (confirm("Deseja excluir este registro de atestado/afastamento?")) {
        absences = absences.filter(a => a.id !== button.dataset.adelete);
        await save();
        showTab("absences");
      }
    }));
  }

  function showAbsenceForm(item = {}) {
    const initialReturn = item.returnDate || calculateAbsenceReturn(item.certificateDate, item.periodDays);
    $("absenceFormSlot").innerHTML = `
      <form id="absenceForm">
        <h3>${item.id ? "Editar atestado/afastamento" : "Cadastrar atestado/afastamento"}</h3>
        <label>Funcionário *</label><input name="name" required maxlength="100" value="${escapeHtml(item.name || "")}" placeholder="Nome do funcionário">
        <div class="formrow">
          <div><label>Data do atestado *</label><input name="certificateDate" type="date" required value="${escapeHtml(item.certificateDate || "")}"></div>
          <div><label>Período de afastamento (dias) *</label><input name="periodDays" type="number" min="1" step="1" required value="${escapeHtml(item.periodDays || "")}" placeholder="Ex.: 5"></div>
        </div>
        <label>Dia de retorno (calculado automaticamente)</label><input name="returnDate" type="date" readonly value="${escapeHtml(initialReturn)}" style="background:#f0f4f8;font-weight:700">
        <label>Observações</label><textarea name="notes" placeholder="Informações adicionais">${escapeHtml(item.notes || "")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar registro</button><button class="secondary" type="button" id="cancelAbsence">Cancelar</button></div>
      </form>`;

    const form = $("absenceForm");
    const updateReturn = () => {
      const date = form.elements.certificateDate.value;
      const days = Number(form.elements.periodDays.value);
      form.elements.returnDate.value = calculateAbsenceReturn(date, days);
    };
    form.elements.certificateDate.addEventListener("change", updateReturn);
    form.elements.periodDays.addEventListener("input", updateReturn);
    $("cancelAbsence").addEventListener("click", renderAbsences);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const fd = new FormData(form);
      const periodDays = Number(fd.get("periodDays"));
      const returnDate = calculateAbsenceReturn(fd.get("certificateDate"), periodDays);
      if (!returnDate) { alert("Informe uma data válida e um período de afastamento de pelo menos 1 dia."); return; }
      const record = {
        id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        name: String(fd.get("name")).trim(),
        certificateDate: fd.get("certificateDate"),
        periodDays,
        returnDate,
        notes: String(fd.get("notes") || "").trim()
      };
      if (item.id) absences = absences.map(existing => existing.id === item.id ? record : existing);
      else absences.push(record);
      await save();
      showTab("absences");
    });
  }


  function renderRecyclings() {
    const sorted = [...recyclings].sort((a,b) => a.date.localeCompare(b.date));
    $("content").innerHTML = `
      <div class="toolbar"><h3>Controle de reciclagem</h3><button class="primary" id="newRecycling">＋ Nova reciclagem</button></div>
      <div id="recyclingFormSlot"></div>
      <div>${sorted.length ? sorted.map(r => `
        <article class="item recycling">
          <h4>♻ ${escapeHtml(r.name)}</h4>
          <div class="meta">Início: ${new Date(r.date+"T00:00:00").toLocaleDateString("pt-BR")}${recyclingOngoing(r) ? ' · <strong>Em Andamento</strong>' : ongoingMarkup(r.date)}<br>
          Final da reciclagem (5 dias): ${new Date((r.endDate || recyclingEndDate(r.date))+"T00:00:00").toLocaleDateString("pt-BR")}<br>
          Posto de trabalho: ${escapeHtml(r.workPost)}<br>
          Cobertura: ${escapeHtml(r.coverage)} · Modalidade: ${escapeHtml(r.type)}<br>${r.notes ? "Observações: "+escapeHtml(r.notes) : ""}</div>
          <div class="actions"><button class="secondary" data-redit="${r.id}">Editar</button><button class="secondary" data-rdelete="${r.id}">Excluir</button></div>
        </article>`).join("") : `<div class="empty">Nenhuma reciclagem cadastrada.</div>`}</div>
      <p class="hint">Cada reciclagem dura 5 dias corridos. A data final é calculada automaticamente a partir da data de início e também aparece na agenda principal.</p>`;
    $("newRecycling").addEventListener("click", () => showRecyclingForm());
    shadow.querySelectorAll("[data-redit]").forEach(b => b.addEventListener("click", () => showRecyclingForm(recyclings.find(r=>r.id===b.dataset.redit))));
    shadow.querySelectorAll("[data-rdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este cadastro de reciclagem?")) {
        recyclings = recyclings.filter(r=>r.id!==b.dataset.rdelete);
        await save(); showTab("recycling");
      }
    }));
  }

  function showRecyclingForm(item={}) {
    $("recyclingFormSlot").innerHTML = `
      <form id="recyclingForm">
        <h3>${item.id ? "Editar reciclagem" : "Cadastrar reciclagem"}</h3>
        <label>Funcionário *</label><input name="name" required maxlength="100" value="${escapeHtml(item.name||"")}" placeholder="Nome do funcionário">
        <label>Data *</label><input name="date" type="date" required value="${escapeHtml(item.date||"")}">
        <label>Posto de trabalho *</label><input name="workPost" required maxlength="100" value="${escapeHtml(item.workPost||"")}" placeholder="Posto de trabalho">
        <label>Cobertura *</label><input name="coverage" required maxlength="100" value="${escapeHtml(item.coverage||"")}" placeholder="Nome do responsável pela cobertura">
        <label>Modalidade *</label><select name="type" required><option value="Normal" ${item.type!=="F.T."?"selected":""}>Normal</option><option value="F.T." ${item.type==="F.T."?"selected":""}>F.T.</option></select>
        <label>Observações</label><textarea name="notes" placeholder="Informações adicionais">${escapeHtml(item.notes||"")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar reciclagem</button><button class="secondary" type="button" id="cancelRecycling">Cancelar</button></div>
      </form>`;
    $("cancelRecycling").addEventListener("click", renderRecyclings);
    $("recyclingForm").addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const r = { id:item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        name:fd.get("name").trim(), date:fd.get("date"), endDate:recyclingEndDate(fd.get("date")), workPost:fd.get("workPost").trim(),
        coverage:fd.get("coverage").trim(), type:fd.get("type"), notes:fd.get("notes").trim() };
      if (item.id) recyclings = recyclings.map(x=>x.id===item.id?r:x); else recyclings.push(r);
      await save(); showTab("recycling");
    });
  }

  function renderAsos() {
    const sorted = [...asos].sort((a,b) => (a.programmedDate||"").localeCompare(b.programmedDate||""));
    $("content").innerHTML = `
      <div class="toolbar"><h3>Controle de Exame ASO</h3><button class="primary" id="newAso">＋ Novo exame ASO</button></div>
      <div id="asoFormSlot"></div>
      <div>${sorted.length ? sorted.map(a => `
        <article class="item aso">
          <h4>🩺 ${escapeHtml(a.name)}</h4>
          <div class="meta">Data programada: ${a.programmedDate ? new Date(a.programmedDate+"T00:00:00").toLocaleDateString("pt-BR")+ongoingMarkup(a.programmedDate) : "Não informada"}<br>
          Data limite do exame: ${a.deadlineDate ? new Date(a.deadlineDate+"T00:00:00").toLocaleDateString("pt-BR")+ongoingMarkup(a.deadlineDate) : "Não informada"}<br>
          Posto: ${escapeHtml(a.workPost||"Não informado")}<br>
          Cobertura: ${escapeHtml(a.coverage||"Não informada")}<br>
          ${a.notes ? "Observações: "+escapeHtml(a.notes) : ""}</div>
          <div class="actions"><button class="secondary" data-asoedit="${a.id}">Editar</button><button class="secondary" data-asodelete="${a.id}">Excluir</button></div>
        </article>`).join("") : `<div class="empty">Nenhum exame ASO cadastrado.</div>`}</div>
      <p class="hint">As datas programadas e limites também aparecem na agenda e nos contadores Hoje, Próximos e Em Andamento.</p>`;
    $("newAso").addEventListener("click", () => showAsoForm());
    shadow.querySelectorAll("[data-asoedit]").forEach(b => b.addEventListener("click", () => {
      const selectedAso = asos.find(a => String(a.id) === String(b.dataset.asoedit));
      if (selectedAso) showAsoForm(selectedAso);
      else alert("Não foi possível localizar este exame ASO. Atualize a lista e tente novamente.");
    }));
    shadow.querySelectorAll("[data-asodelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este exame ASO?")) { asos=asos.filter(a=>a.id!==b.dataset.asodelete); await save(); showTab("aso"); }
    }));
  }

  function showAsoForm(item={}) {
    $("asoFormSlot").innerHTML = `
      <form id="asoForm">
        <h3>${item.id ? "Editar exame ASO" : "Cadastrar exame ASO"}</h3>
        <label>Funcionário *</label><input name="name" required maxlength="100" value="${escapeHtml(item.name||"")}" placeholder="Nome do funcionário">
        <div class="formrow"><div><label>Data programada *</label><input name="programmedDate" type="date" required value="${escapeHtml(item.programmedDate||"")}"></div>
        <div><label>Data limite do exame *</label><input name="deadlineDate" type="date" required value="${escapeHtml(item.deadlineDate||"")}"></div></div>
        <label>Posto *</label><input name="workPost" required maxlength="100" value="${escapeHtml(item.workPost||"")}" placeholder="Posto de trabalho">
        <label>Cobertura</label><input name="coverage" maxlength="100" value="${escapeHtml(item.coverage||"")}" placeholder="Nome do responsável pela cobertura">
        <label>Observações</label><textarea name="notes" placeholder="Informações adicionais">${escapeHtml(item.notes||"")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar exame ASO</button><button class="secondary" type="button" id="cancelAso">Cancelar</button></div>
      </form>`;
    $("cancelAso").addEventListener("click", renderAsos);
    $("asoForm").addEventListener("submit", async e => {
      e.preventDefault(); const fd=new FormData(e.currentTarget);
      const a={id:item.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now())), name:fd.get("name").trim(), programmedDate:fd.get("programmedDate"), deadlineDate:fd.get("deadlineDate"), workPost:fd.get("workPost").trim(), coverage:fd.get("coverage").trim(), notes:fd.get("notes").trim()};
      if(a.deadlineDate < a.programmedDate){ alert("A data limite não pode ser anterior à data programada."); return; }
      if(item.id) asos=asos.map(x=>String(x.id)===String(item.id)?a:x); else asos.push(a);
      await save(); showTab("aso");
    });
  }

  function vacationReturnDate(v) {
    const [y,m,d] = v.startDate.split("-").map(Number);
    const result = new Date(y, m-1, d + Number(v.days));
    return `${String(result.getDate()).padStart(2,"0")}/${String(result.getMonth()+1).padStart(2,"0")}/${result.getFullYear()}`;
  }

  function renderVacations() {
    const sorted = [...vacations].sort((a,b) => a.startDate.localeCompare(b.startDate));
    $("content").innerHTML = `
      <div class="toolbar"><h3>Controle de férias</h3><button class="primary" id="newVacation">＋ Nova férias</button></div>
      <div id="vacationFormSlot"></div>
      <div>${sorted.length ? sorted.map(v => `
        <article class="item">
          <h4>🏖 ${escapeHtml(v.name)}</h4>
          <div class="meta">Saída: ${new Date(v.startDate+"T00:00:00").toLocaleDateString("pt-BR")}${ongoingMarkup(v.startDate)}<br>
          Período: ${v.days} dias · Retorno: ${vacationReturnDate(v)}<br>
          Posto de trabalho: ${escapeHtml(v.workPost||"Não informado")}<br>
          ${v.notes ? "Observações: "+escapeHtml(v.notes) : ""}</div>
          <div class="actions"><button class="secondary" data-vedit="${v.id}">Editar</button><button class="secondary" data-vdelete="${v.id}">Excluir</button></div>
        </article>`).join("") : `<div class="empty">Nenhuma férias cadastrada.<br>Cadastre a saída para calcular o retorno e receber avisos.</div>`}</div>
      <p class="hint">Você receberá um aviso no dia da saída e lembretes 7, 3 e 1 dia antes do retorno, além do aviso no dia do retorno. O Chrome precisa estar em execução e as notificações permitidas.</p>`;
    $("newVacation").addEventListener("click", () => showVacationForm());
    shadow.querySelectorAll("[data-vedit]").forEach(b => b.addEventListener("click", () => showVacationForm(vacations.find(v=>v.id===b.dataset.vedit))));
    shadow.querySelectorAll("[data-vdelete]").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Deseja excluir este cadastro de férias?")) {
        vacations = vacations.filter(v=>v.id!==b.dataset.vdelete);
        await save();
      }
    }));
  }

  function showVacationForm(item={}) {
    $("vacationFormSlot").innerHTML = `
      <form id="vacationForm">
        <h3>${item.id ? "Editar férias" : "Cadastrar férias"}</h3>
        <label>Funcionário *</label><input name="name" required maxlength="100" value="${escapeHtml(item.name||"")}" placeholder="Nome do funcionário">
        <div class="formrow">
          <div><label>Data de saída *</label><input name="startDate" type="date" required value="${escapeHtml(item.startDate||"")}"></div>
          <div><label>Duração *</label><select name="days" style="width:100%;border:1px solid #cbd8e5;border-radius:7px;padding:9px;color:#20384d"><option value="30" ${Number(item.days||30)===30?"selected":""}>30 dias</option><option value="20" ${Number(item.days)===20?"selected":""}>20 dias</option></select></div>
        </div>
        <label>Posto de trabalho *</label><input name="workPost" required maxlength="100" value="${escapeHtml(item.workPost||"")}" placeholder="Ex.: Posto 1, Recepção, Unidade Centro">
        <label>Observações</label><textarea name="notes" placeholder="Informações adicionais">${escapeHtml(item.notes||"")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar férias</button><button class="secondary" type="button" id="cancelVacation">Cancelar</button></div>
      </form>`;
    $("cancelVacation").addEventListener("click", renderVacations);
    $("vacationForm").addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const v = { id:item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        name:fd.get("name").trim(), startDate:fd.get("startDate"), days:Number(fd.get("days")), workPost:fd.get("workPost").trim(), notes:fd.get("notes").trim() };
      if (item.id) vacations = vacations.map(x=>x.id===item.id?v:x); else vacations.push(v);
      await save();
      showTab("vacations");
    });
  }

  function showForm(item={}) {
    const value = item.datetime ? new Date(item.datetime).getTime() : null;
    const localValue = value ? (() => { const d=new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; })() : "";
    $("formSlot").innerHTML = `
      <form id="appointmentForm">
        <h3>${item.id ? "Editar agendamento" : "Novo agendamento"}</h3>
        <label>Compromisso/Atividade *</label><input name="title" required maxlength="100" value="${escapeHtml(item.title||"")}" placeholder="Ex.: Reunião com supervisor">
        <div class="formrow"><div><label>Data e horário *</label><input name="datetime" type="datetime-local" required value="${localValue}"></div><div><label>Local/Posto/Cliente/Outros</label><input name="location" value="${escapeHtml(item.location||"")}" placeholder="Local, posto, cliente ou outros"></div></div>
        <label>Nome do Agendado</label><input name="responsible" value="${escapeHtml(item.responsible||"")}" placeholder="Nome do agendado">
        <label>Descrição</label><textarea name="description" placeholder="Detalhes do compromisso">${escapeHtml(item.description||"")}</textarea>
        <label>Observações</label><textarea name="notes" placeholder="Informações adicionais">${escapeHtml(item.notes||"")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar agendamento</button><button class="secondary" type="button" id="cancelForm">Cancelar</button></div>
      </form>`;
    $("cancelForm").addEventListener("click", () => { editingId=null; renderAgenda(); });
    $("appointmentForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const obj={
        id: editingId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        title: fd.get("title").trim(), datetime: fd.get("datetime"),
        location: fd.get("location").trim(), responsible: fd.get("responsible").trim(),
        description: fd.get("description").trim(), notes: fd.get("notes").trim(),
        status: item.status || "pendente"
      };
      if(editingId) appointments=appointments.map(x=>x.id===editingId?obj:x); else appointments.push(obj);
      editingId=null; await save();
    });
  }

  function renderSwapDays() {
    const dateFmt = value => value ? new Date(value + "T00:00:00").toLocaleDateString("pt-BR") : "Não informado";
    $("content").innerHTML = `
      <div class="toolbar"><h3>Troca de Folga</h3><button class="primary" id="newSwapBtn">＋ Nova solicitação</button></div>
      <div id="swapFormSlot"></div>
      ${swapDays.length ? swapDays.slice().sort((a,b) => (b.createdAt||"").localeCompare(a.createdAt||"")).map(item => `
        <article class="item" style="border-left-color:${item.decision === "Autorizado" ? "#3c9b69" : item.decision === "Não Autorizado" ? "#c73c3c" : "#e0a52b"}">
          <h4>🔄 Troca de folga — ${escapeHtml(item.requester)}</h4>
          <div class="meta">Posto de Trabalho: ${escapeHtml(item.workPost)}<br>
          <strong class="swap-name-highlight">Solicitante: ${escapeHtml(item.requester)}</strong><br>
          Dia que Folgará: ${dateFmt(item.dayOff)}${ongoingMarkup(item.dayOff)}<br>
          Dia que Trabalhará: ${dateFmt(item.dayWork)}${ongoingMarkup(item.dayWork)}<br>
          <strong class="swap-name-highlight">De Acordo: ${escapeHtml(item.agreedBy || "Não informado")}</strong><br>
          Dia que Folgará: ${dateFmt(item.agreedDayOff)}<br>
          Dia que Trabalhará: ${dateFmt(item.agreedDayWork)}<br>
          Situação: <strong>${escapeHtml(item.decision || "Pendente")}</strong><br>
          ${item.notes ? "Observações: " + escapeHtml(item.notes) : ""}</div>
          <div class="actions"><button class="secondary" data-swapedit="${item.id}">Editar</button><button class="secondary" data-swapdelete="${item.id}">Excluir</button></div>
        </article>`).join("") : `<div class="empty">Nenhuma solicitação de troca de folga cadastrada.</div>`}
    `;
    $("newSwapBtn").addEventListener("click", () => { editingSwapId = null; showSwapForm(); });
    shadow.querySelectorAll("[data-swapedit]").forEach(btn => btn.addEventListener("click", () => {
      const selected = swapDays.find(x => String(x.id) === String(btn.dataset.swapedit));
      if (selected) showSwapForm(selected);
    }));
    shadow.querySelectorAll("[data-swapdelete]").forEach(btn => btn.addEventListener("click", async () => {
      if (confirm("Deseja excluir esta solicitação de troca de folga?")) {
        swapDays = swapDays.filter(x => String(x.id) !== String(btn.dataset.swapdelete));
        await save(); showTab("swapDays");
      }
    }));
  }

  function showSwapForm(item = {}) {
    editingSwapId = item.id || null;
    const slot = $("swapFormSlot");
    slot.innerHTML = `
      <form id="swapForm">
        <h3>${item.id ? "Editar troca de folga" : "Nova troca de folga"}</h3>
        <label>Posto de Trabalho *</label><input name="workPost" required maxlength="120" value="${escapeHtml(item.workPost||"")}">
        <label>Nome do Solicitante *</label><input name="requester" required maxlength="120" value="${escapeHtml(item.requester||"")}">
        <div class="formrow"><div><label>Dia que Folgará *</label><input name="dayOff" type="date" required value="${escapeHtml(item.dayOff||"")}"></div><div><label>Dia que Trabalhará *</label><input name="dayWork" type="date" required value="${escapeHtml(item.dayWork||"")}"></div></div>
        <label style="margin-top:14px">De Acordo:</label><input name="agreedBy" maxlength="120" value="${escapeHtml(item.agreedBy||"")}">
        <div class="formrow"><div><label>Dia que Folgará</label><input name="agreedDayOff" type="date" value="${escapeHtml(item.agreedDayOff||"")}"></div><div><label>Dia que Trabalhará</label><input name="agreedDayWork" type="date" value="${escapeHtml(item.agreedDayWork||"")}"></div></div>
        <label>Autorização</label><select name="decision"><option value="Pendente" ${!item.decision || item.decision==="Pendente"?"selected":""}>Pendente</option><option value="Autorizado" ${item.decision==="Autorizado"?"selected":""}>Autorizado</option><option value="Não Autorizado" ${item.decision==="Não Autorizado"?"selected":""}>Não Autorizado</option></select>
        <label>Observações</label><textarea name="notes">${escapeHtml(item.notes||"")}</textarea>
        <div class="formbuttons"><button class="primary" type="submit">Salvar solicitação</button><button class="secondary" type="button" id="cancelSwap">Cancelar</button></div>
      </form>`;
    $("cancelSwap").addEventListener("click", () => { editingSwapId = null; renderSwapDays(); });
    $("swapForm").addEventListener("submit", async event => {
      event.preventDefault();
      const fd = new FormData(event.currentTarget);
      const record = {
        id: editingSwapId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        workPost: fd.get("workPost").trim(), requester: fd.get("requester").trim(),
        dayOff: fd.get("dayOff"), dayWork: fd.get("dayWork"), agreedBy: fd.get("agreedBy").trim(),
        agreedDayOff: fd.get("agreedDayOff"), agreedDayWork: fd.get("agreedDayWork"),
        decision: fd.get("decision"), notes: fd.get("notes").trim(), createdAt: item.createdAt || new Date().toISOString()
      };
      if (editingSwapId) swapDays = swapDays.map(x => String(x.id) === String(editingSwapId) ? record : x);
      else swapDays.push(record);
      editingSwapId = null;
      await save(); showTab("swapDays");
    });
    slot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Backup completo dos dados locais da extensão em arquivo JSON.
  function backupData() {
    const payload = {
      app: "Central de Agendamentos - Roundcube",
      version: "1.4.13",
      exportedAt: new Date().toISOString(),
      data: { appointments, vacations, recyclings, asos, absences, swapDays, otherAppointments }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_central_agendamentos_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    alert("Backup gerado. Guarde o arquivo JSON em um local seguro.");
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const data = parsed?.data;
      const keys = ["appointments", "vacations", "recyclings", "asos", "absences", "swapDays"];
      if (!data || !keys.every(key => Array.isArray(data[key]))) {
        throw new Error("O arquivo não contém todos os dados esperados da Central de Agendamentos.");
      }
      if (!confirm("A importação substituirá todos os registros atuais pelos dados do backup. Deseja continuar?")) return;
      appointments = data.appointments;
      vacations = data.vacations;
      recyclings = data.recyclings;
      asos = data.asos;
      absences = data.absences;
      swapDays = data.swapDays;
      otherAppointments = Array.isArray(data.otherAppointments) ? data.otherAppointments : [];
      await chrome.storage.local.set({ appointments, vacations, recyclings, asos, absences, swapDays, otherAppointments });
      await load();
      alert("Backup importado com sucesso!");
    } catch (error) {
      alert(`Não foi possível importar o backup: ${error.message || "arquivo inválido"}`);
    } finally {
      $("backupFile").value = "";
    }
  }
  $("backupBtn").addEventListener("click", backupData);
  $("importBtn").addEventListener("click", () => $("backupFile").click());
  $("backupFile").addEventListener("change", event => importBackup(event.target.files?.[0]));

  function setPanelOpen(open) {
    $("panel").classList.toggle("open", open);
    // Oculta o botão flutuante enquanto a janela está aberta.
    $("launch").style.display = open ? "none" : "";
  }
  $("launch").addEventListener("click", () => setPanelOpen(!$ ("panel").classList.contains("open")));
  $("close").addEventListener("click", () => setPanelOpen(false));
  $("agendaTab").addEventListener("click", () => showTab("agenda"));
  $("absenceTab").addEventListener("click", () => showTab("absences"));
  $("vacationTab").addEventListener("click", () => showTab("vacations"));
  $("recyclingTab").addEventListener("click", () => showTab("recycling"));
  $("asoTab").addEventListener("click", () => showTab("aso"));
  $("swapTab").addEventListener("click", () => showTab("swapDays"));
  $("otherTab").addEventListener("click", () => showTab("otherAppointments"));

  // Aviso discreto ao entrar no webmail com o próximo compromisso da agenda.
  // Impede que o observador recrie o aviso depois de fechado ou expirado.
  let loginNoticeHandled = false;
  function roundcubeIsLoggedIn() {
    return !!document.querySelector('#taskbar, #messagelist, #mailboxcontainer, #mailview-right') &&
      !document.querySelector('#login-form, form#login-form');
  }

  function nextAgendaEvent(data) {
    const now = new Date();
    const events = [];
    const add = (value, title, detail = "") => {
      if (!value) return;
      let date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [y,m,d] = value.split("-").map(Number);
        date = new Date(y, m - 1, d, 0, 0, 0);
      } else date = new Date(value);
      if (!Number.isNaN(date.getTime()) && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        events.push({ date, title, detail });
      }
    };
    (data.appointments || []).forEach(a => {
      if (a.status !== "concluido") add(a.datetime, a.title || "Agendamento", a.location || "");
    });
    (data.vacations || []).forEach(v => {
      if (!v.startDate) return;
      add(v.startDate, `Início das férias — ${v.name || "Funcionário"}`, v.workPost || "");
      const [y,m,d] = v.startDate.split("-").map(Number);
      const ret = new Date(y, m - 1, d + Number(v.days || 30));
      add(`${ret.getFullYear()}-${String(ret.getMonth()+1).padStart(2,"0")}-${String(ret.getDate()).padStart(2,"0")}`, `Retorno de férias — ${v.name || "Funcionário"}`, v.workPost || "");
    });
    (data.recyclings || []).forEach(r => add(r.date, `Reciclagem — ${r.name || "Funcionário"}`, r.workPost || ""));
    (data.asos || []).forEach(a => {
      add(a.programmedDate, `Exame ASO — ${a.name || "Funcionário"}`, "Data programada");
      add(a.deadlineDate, `Prazo do ASO — ${a.name || "Funcionário"}`, "Data limite");
    });
    (data.absences || []).forEach(a => add(a.returnDate, `Retorno do afastamento — ${a.name || "Funcionário"}`, "Dia de retorno"));
    (data.otherAppointments || []).forEach(item => add(item.datetime, item.title || "Outro compromisso", item.location || ""));
    (data.swapDays || []).forEach(item => {
      add(item.dayOff, `Troca de folga — ${item.requester || "Solicitante"} (folgará)`, item.workPost || "");
      add(item.dayWork, `Troca de folga — ${item.requester || "Solicitante"} (trabalhará)`, item.workPost || "");
    });
    return events.sort((a,b) => a.date - b.date)[0] || null;
  }

  async function showLoginAgendaNotice() {
    if (loginNoticeHandled || !roundcubeIsLoggedIn() || document.getElementById('central-agenda-login-notice')) return;
    const data = await chrome.storage.local.get(["appointments", "vacations", "recyclings", "asos", "absences", "swapDays"]);
    if (loginNoticeHandled || !roundcubeIsLoggedIn() || document.getElementById('central-agenda-login-notice')) return;
    loginNoticeHandled = true;
    const next = nextAgendaEvent(data);
    const notice = document.createElement('div');
    notice.id = 'central-agenda-login-notice';
    notice.style.cssText = 'position:fixed;z-index:2147483647;top:12px;left:50%;transform:translateX(-50%);max-width:min(560px,calc(100vw - 30px));padding:10px 14px;border-radius:9px;background:#123b63;color:#fff;box-shadow:0 5px 22px #0004;font:13px Arial,sans-serif;display:flex;align-items:center;gap:12px;';
    const message = document.createElement('span');
    message.style.cssText = 'line-height:1.45;';
    if (next) {
      const dateText = next.date.toLocaleString('pt-BR', { dateStyle:'short', timeStyle: /^\d{4}-\d{2}-\d{2}$/.test(String(next.date)) ? undefined : 'short' });
      message.textContent = `📅 Próximo agendamento: ${next.title} — ${dateText}${next.detail ? ` (${next.detail})` : ''}`;
    } else {
      message.textContent = '📅 Não há agendamentos futuros cadastrados.';
    }
    const close = document.createElement('button');
    close.type = 'button'; close.textContent = '×';
    close.setAttribute('aria-label', 'Fechar aviso');
    close.style.cssText = 'border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer;padding:0 2px;';
    const dismissNotice = () => {
      if (notice.isConnected) notice.remove();
      loginNoticeHandled = true;
    };
    close.addEventListener('click', dismissNotice);
    notice.append(message, close);
    document.body.appendChild(notice);
    window.setTimeout(dismissNotice, 10000);
  }

  const loginNoticeObserver = new MutationObserver(() => showLoginAgendaNotice());
  loginNoticeObserver.observe(document.documentElement, { childList:true, subtree:true });
  window.setTimeout(showLoginAgendaNotice, 800);
  window.setInterval(showLoginAgendaNotice, 2500);

  load();
})();
