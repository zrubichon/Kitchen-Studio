// Mise V18 — reliable forgot-password flow through server endpoint
(function(){
  const $=s=>document.querySelector(s);
  function openReset(prefill=''){
    const dlg=$('#forgotPasswordModal'),input=$('#forgotPasswordEmail'),status=$('#forgotPasswordStatus');
    if(input)input.value=prefill||'';
    if(status)status.innerHTML='<span class="status-dot"></span><span>Entrez votre email puis cliquez sur “Envoyer le lien”.</span>';
    if(!dlg)return;
    try{openModal(dlg)}catch{dlg.showModal()}
    setTimeout(()=>input?.focus(),80);
  }
  function currentEmail(){
    return $('#cloudAccountEmail')?.value.trim()||$('#firstRunEmail')?.value.trim()||'';
  }

  // Capture phase deliberately supersedes older handlers.
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#forgotPassword,#firstRunForgotPassword');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openReset(currentEmail());
  },true);

  $('#forgotPasswordForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('#forgotPasswordEmail')?.value.trim()||'',button=$('#forgotPasswordSend'),status=$('#forgotPasswordStatus');
    const say=(m,ok=false)=>{if(status)status.innerHTML='<span class="status-dot '+(ok?'ok':'')+'"></span><span>'+m+'</span>'};
    if(!email){say('Entrez votre adresse email.');return}
    button.disabled=true;button.textContent='Envoi…';say('Demande de réinitialisation en cours…');
    try{
      const r=await fetch('/api/password-reset',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});
      const d=await r.json().catch(()=>({}));
      if(r.ok){
        say('Demande envoyée. Vérifiez votre boîte mail et vos spams. Le lien vous ramènera sur Mise pour choisir un nouveau mot de passe.',true);
      }else if(d.code==='smtp_restricted'){
        say('L’envoi est bloqué par le serveur email Supabase actuel. Le compte existe toujours : il faut activer un SMTP personnalisé pour que les emails de récupération puissent partir vers les utilisateurs.');
      }else{
        say(d.message||'Impossible d’envoyer le lien pour le moment.');
      }
    }catch{
      say('Impossible de contacter le service de récupération. Réessayez dans quelques instants.');
    }finally{
      button.disabled=false;button.textContent='Envoyer le lien';
    }
  });

  window.MisePasswordReset={open:openReset};
})();