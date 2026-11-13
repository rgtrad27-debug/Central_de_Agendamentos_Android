const ALARM_NAME = "central-agendamentos-verificar";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
});

function dayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function daysUntil(date) {
  return Math.round((dayStart(date) - dayStart(new Date())) / 86400000);
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const data = await chrome.storage.local.get(["appointments", "vacations", "recyclings", "asos", "sentAlerts"]);
  const appointments = Array.isArray(data.appointments) ? data.appointments : [];
  const sentAlerts = data.sentAlerts || {};
  let changed = false;

  for (const item of appointments) {
    if (!item || item.status === "concluido" || !item.datetime) continue;
    const when = new Date(item.datetime);
    if (Number.isNaN(when.getTime())) continue;

    const remaining = daysUntil(when);
    let bucket = null;
    if (remaining <= 0) bucket = "hoje";
    else if (remaining <= 1) bucket = "1dia";
    else if (remaining <= 3) bucket = "3dias";
    else if (remaining <= 7) bucket = "7dias";

    if (!bucket) continue;
    const key = `${item.id}:${bucket}`;
    if (sentAlerts[key]) continue;

    const title = bucket === "hoje" ? "Compromisso para hoje" :
      bucket === "1dia" ? "Compromisso amanhã" :
      bucket === "3dias" ? "Compromisso em até 3 dias" :
      "Compromisso em até 7 dias";

    const dateText = when.toLocaleString("pt-BR", {
      dateStyle: "short", timeStyle: "short"
    });

    chrome.notifications.create(`agenda-${key}`, {
      type: "basic",
      iconUrl: "icon128.png",
      title,
      message: `${item.title || "Agendamento"} — ${dateText}`,
      priority: 2
    });

    sentAlerts[key] = Date.now();
    changed = true;
  }


  const vacations = Array.isArray(data.vacations) ? data.vacations : [];
  for (const vacation of vacations) {
    if (!vacation || !vacation.id || !vacation.startDate || !vacation.days) continue;
    const start = new Date(`${vacation.startDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) continue;
    const returnDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + Number(vacation.days));
    const departureRemaining = daysUntil(start);
    const returnRemaining = daysUntil(returnDate);
    const alerts = [];
    if (departureRemaining === 0) alerts.push(["saida", "Início das férias", `Hoje começa o período de férias de ${vacation.name || "funcionário"}. Posto: ${vacation.workPost || "não informado"}.`]);
    if (returnRemaining === 7) alerts.push(["retorno7", "Retorno de férias em 7 dias", `${vacation.name || "Funcionário"} (${vacation.workPost || "posto não informado"}) retorna em uma semana.`]);
    if (returnRemaining === 3) alerts.push(["retorno3", "Retorno de férias em 3 dias", `${vacation.name || "Funcionário"} (${vacation.workPost || "posto não informado"}) retorna em 3 dias.`]);
    if (returnRemaining === 1) alerts.push(["retorno1", "Retorno de férias amanhã", `${vacation.name || "Funcionário"} (${vacation.workPost || "posto não informado"}) retorna amanhã.`]);
    if (returnRemaining === 0) alerts.push(["retornoHoje", "Retorno de férias hoje", `${vacation.name || "Funcionário"} (${vacation.workPost || "posto não informado"}) deve retornar hoje.`]);
    for (const [kind, title, message] of alerts) {
      const key = `ferias:${vacation.id}:${kind}`;
      if (sentAlerts[key]) continue;
      chrome.notifications.create(`agenda-${key}`, {
        type: "basic", iconUrl: "icon128.png", title, message, priority: 2
      });
      sentAlerts[key] = Date.now();
      changed = true;
    }
  }

  const recyclings = Array.isArray(data.recyclings) ? data.recyclings : [];
  for (const recycling of recyclings) {
    if (!recycling || !recycling.id || !recycling.date) continue;
    const when = new Date(`${recycling.date}T00:00:00`);
    if (Number.isNaN(when.getTime()) || daysUntil(when) !== 0) continue;
    const key = `reciclagem:${recycling.id}:hoje`;
    if (sentAlerts[key]) continue;
    chrome.notifications.create(`agenda-${key}`, {
      type: "basic", iconUrl: "icon128.png", title: "Reciclagem hoje",
      message: `${recycling.name || "Funcionário"} — Posto: ${recycling.workPost || "não informado"}. Cobertura: ${recycling.coverage || "não informada"}. Modalidade: ${recycling.type || "não informada"}.`,
      priority: 2
    });
    sentAlerts[key] = Date.now();
    changed = true;
  }



  const asos = Array.isArray(data.asos) ? data.asos : [];
  for (const aso of asos) {
    if (!aso || !aso.id) continue;
    const dates = [
      ["programado", aso.programmedDate, "Exame ASO programado", "O exame ASO de"],
      ["limite", aso.deadlineDate, "Data limite do exame ASO", "A data limite do exame ASO de"]
    ];
    for (const [kind, dateValue, title, prefix] of dates) {
      if (!dateValue) continue;
      const when = new Date(`${dateValue}T00:00:00`);
      if (Number.isNaN(when.getTime())) continue;
      const remaining = daysUntil(when);
      let bucket = null;
      if (remaining === 0) bucket = "hoje";
      else if (remaining === 1) bucket = "1dia";
      else if (remaining === 3) bucket = "3dias";
      else if (remaining === 7) bucket = "7dias";
      else if (remaining < 0 && kind === "limite") bucket = "atrasado";
      if (!bucket) continue;
      const key = `aso:${aso.id}:${kind}:${bucket}`;
      if (sentAlerts[key]) continue;
      const alertTitle = bucket === "hoje" ? `${title} hoje` :
        bucket === "1dia" ? `${title} amanhã` :
        bucket === "atrasado" ? "Exame ASO com prazo vencido" : `${title} em ${bucket === "3dias" ? "3 dias" : "7 dias"}`;
      const dateText = when.toLocaleDateString("pt-BR");
      chrome.notifications.create(`agenda-${key}`, {
        type: "basic", iconUrl: "icon128.png", title: alertTitle,
        message: `${prefix} ${aso.name || "funcionário"} — ${dateText}. Posto: ${aso.workPost || "não informado"}. Cobertura: ${aso.coverage || "não informada"}.`,
        priority: 2
      });
      sentAlerts[key] = Date.now(); changed = true;
    }
  }

  if (changed) await chrome.storage.local.set({ sentAlerts });
});
