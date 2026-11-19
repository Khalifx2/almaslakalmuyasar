/* ============================================================
   EGYPT STUDENT BUDGET CALCULATOR — calculation engine
   ------------------------------------------------------------
   Cairo-only (Nasr City + family compounds). All prices are stored
   in EGP (base currency) inside EGYPT_COST_DATA below. To update
   prices later, edit ONLY the numbers in EGYPT_COST_DATA and
   FX_PER_EGP — nothing else in this file needs to change.

   Housing and lifestyle categories store [low, mid, high], mapping
   directly to Budget / Recommended / Comfortable. Arabic and Qurʾān
   study costs are tier-independent (a real institute price is a
   real institute price, not a lifestyle choice) unless the user
   overrides with their own figure.
   ============================================================ */

const EGYPT_COST_DATA = {
  // Foreign-currency value of 1 EGP (used only for display conversion —
  // every calculation below happens in EGP first). Update these numbers
  // as the exchange rate moves; nothing else needs to change.
  fxPerEGP: { EGP:1, GBP:1/62, USD:1/49, EUR:1/53, AUD:1/32, CAD:1/36, NOK:1/4.6, SAR:1/13.1 },
  roundStep: { EGP:50, GBP:1, USD:1, EUR:1, AUD:1, CAD:1, NOK:10, SAR:1 },
  symbol: { EGP:'EGP ', GBP:'£', USD:'$', EUR:'€', AUD:'A$', CAD:'C$', NOK:'kr', SAR:'SAR ' },
  symbolAfter: { NOK:true },

  // Housing — monthly EGP by area, for shared vs private/studio. [low, mid, high]
  housing: {
    nasrcity: { shared:[3500,4500,5500], private:[7000,8500,10500] },
    gardenia: { shared:[4700,6100,7400], private:[9500,11500,14200] },
    rehab:    { shared:[4400,5600,6900], private:[8800,10600,13100] },
    newcairo: { shared:[5600,7200,8800], private:[11200,13600,16800] }
  },

  // Food — monthly EGP per person. [low, mid, high]
  food: {
    cook:     [2000, 2500, 3000],
    balanced: [3000, 3800, 4500],
    eatout:   [5000, 6200, 7500]
  },

  // Transport — monthly EGP. [low, mid, high]
  transport: {
    walk:   [200, 300, 400],
    public: [400, 550, 700],
    mixed:  [700, 950, 1200],
    taxi:   [1500, 2000, 2500]
  },

  // Arabic institutes — monthly EGP average per level, tier-independent
  // (a real institute price, not a lifestyle scale). Sourced from the
  // institute cards in this guide — update here if institute pricing changes.
  arabicInstitutes: {
    none:      0,
    ibaanah:   9800,
    fajr:      4460,
    raseel:    2500,
    furqan:    3000,
    lisan:     4500,
    fusha:     2500,
    diya:      2800,
    darhafsah: 2450,
    private:   4500,
    self:      500
  },

  // Qurʾān study — monthly EGP, tier-independent.
  quran: {
    none:      0,
    institute: 2500,
    private:   2200   // ~2 hrs/week at £3–6/hr — rough estimate, override recommended
  },

  // Mobile & internet — monthly EGP, flat
  mobile: [300, 400, 500],

  // Personal & household — monthly EGP. [low, mid, high]
  personal: [800, 1000, 1400],

  // Social & leisure — monthly EGP. [low, mid, high]
  social: {
    low:      [500, 700, 900],
    moderate: [900, 1200, 1600],
    high:     [1800, 2400, 3000]
  },

  // Buffer / miscellaneous — % of everything above, varies by tier
  bufferPct: { budget: 0.05, recommended: 0.10, comfortable: 0.15 },

  // One-time setup costs — EGP. [low, high] only (no "mid" needed)
  setup: {
    simSetup:        [200, 400],
    householdItems:  [3000, 6000],
    initialGroceries:[800, 1200],
    arrivalTransport:[300, 700],
    booksMaterials:  [500, 1200],
    entryVisa:       [1300, 1600]      // ~$25–30 airport arrival visa, per the Visa Guide section
  }
};

var calcPath = 'solo';
var calcTier = 'recommended';
var segState = { famContrib:'no' };

function setSeg(btn){
  var grp = btn.dataset.grp, val = btn.dataset.val;
  segState[grp] = val;
  document.querySelectorAll('.seg-btn[data-grp="'+grp+'"]').forEach(function(b){
    b.classList.toggle('active', b===btn);
  });
  updateCalc();
}

function toggleFamRent(){
  document.getElementById('famRentWrap').style.display = segState.famContrib==='yes' ? 'block' : 'none';
  updateCalc();
}

function setTier(btn){
  calcTier = btn.dataset.tier;
  document.querySelectorAll('.tier-btn').forEach(function(b){ b.classList.toggle('active', b===btn); });
  updateCalc();
}

function setCalcPath(path){
  calcPath = path;
  ['solo','family'].forEach(function(p){
    var b=document.getElementById('cp-'+p);
    if(b){ b.classList.toggle('active', p===path); b.setAttribute('aria-pressed', p===path?'true':'false'); }
  });
  document.getElementById('familySub').style.display = path==='family'? 'block' : 'none';
  document.getElementById('accomBlock').style.display= path==='solo'  ? 'block' : 'none';

  var titleEl = document.getElementById('pathAdviceTitle');
  var textEl  = document.getElementById('pathAdviceText');
  if(path==='family'){
    titleEl.textContent = 'Travelling with Family';
    textEl.textContent  = 'Housing here reflects only what you personally contribute, not the full household cost — most families share this rather than the student paying alone.';
  } else {
    titleEl.textContent = 'Solo Student';
    textEl.textContent  = 'Adjust the fields above — the estimate updates instantly. All figures are editable if you already know your actual costs.';
  }
  updateCalc();
}

function toggleFinetune(){
  var box=document.getElementById('finetuneBox'), btn=document.getElementById('finetuneBtn');
  var open = box.style.display==='block';
  box.style.display = open ? 'none' : 'block';
  btn.setAttribute('aria-expanded', open ? 'false' : 'true');
}
function toggleBreakdown(){
  var box=document.getElementById('breakdownBox'), btn=document.getElementById('breakdownBtn');
  var open = box.style.display==='block';
  box.style.display = open ? 'none' : 'block';
  btn.setAttribute('aria-expanded', open ? 'false' : 'true');
}

function fmtEGP(v, cur){
  var d = EGYPT_COST_DATA;
  var step = d.roundStep[cur] || 1;
  var n = Math.round((v * d.fxPerEGP[cur]) / step) * step;
  var out = n.toLocaleString('en-US');
  return d.symbolAfter[cur] ? (out + ' ' + d.symbol[cur]) : (d.symbol[cur] + out);
}

// tierIdx: 0=budget(low) 1=recommended(mid) 2=comfortable(high)
function tierIdx(tier){ return tier==='budget' ? 0 : tier==='comfortable' ? 2 : 1; }
function calcCategory(range, tier){ return range[tierIdx(tier)]; }

function computeBudget(tier){
  var d = EGYPT_COST_DATA;

  // ── HOUSING ──
  var housing = 0;
  if(calcPath === 'solo'){
    var override = document.getElementById('rentOverrideOn').checked;
    if(override){
      housing = +document.getElementById('rentOverride').value || 0;
    } else {
      var area = document.getElementById('area').value;
      var sharing = document.getElementById('sharing').value; // 'shared' or 'private'
      housing = calcCategory(d.housing[area][sharing], tier);
    }
  } else {
    housing = segState.famContrib==='yes' ? (+document.getElementById('famRent').value || 0) : 0;
  }

  // ── FOOD ──
  var foodVal = document.getElementById('food').value;
  var food = calcCategory(d.food[foodVal], tier);

  // ── TRANSPORT ──
  var transVal = document.getElementById('transport').value;
  var transport = calcCategory(d.transport[transVal], tier);

  // ── MOBILE ──
  var mobileOverrideVal = +document.getElementById('mobileOverride').value;
  var mobile = mobileOverrideVal > 0 ? mobileOverrideVal : calcCategory(d.mobile, tier);

  // ── ARABIC STUDY (tier-independent — real institute price) ──
  var arabic = 0;
  var arabicOverride = document.getElementById('arabicOverrideOn').checked;
  if(arabicOverride){
    arabic = +document.getElementById('arabicOverride').value || 0;
  } else {
    var arabicVal = document.getElementById('arabicInst').value;
    arabic = d.arabicInstitutes[arabicVal];
  }

  // ── QURAN STUDY (tier-independent) ──
  var quran = 0;
  var quranOverride = document.getElementById('quranOverrideOn').checked;
  if(quranOverride){
    quran = +document.getElementById('quranOverride').value || 0;
  } else {
    var quranVal = document.getElementById('quranStudy').value;
    quran = d.quran[quranVal];
  }

  // ── PERSONAL ──
  var personalOverrideVal = +document.getElementById('personalOverride').value;
  var personal = personalOverrideVal > 0 ? personalOverrideVal : calcCategory(d.personal, tier);

  // ── SOCIAL ──
  var socialVal = document.getElementById('social').value;
  var social = calcCategory(d.social[socialVal], tier);

  var subtotal = housing + food + transport + mobile + arabic + quran + personal + social;
  var buffer = subtotal * d.bufferPct[tier];
  var monthly = subtotal + buffer;

  return { housing:housing, food:food, transport:transport, mobile:mobile, arabic:arabic, quran:quran, personal:personal, social:social, buffer:buffer, monthly:monthly };
}

function computeSetup(){
  var d = EGYPT_COST_DATA.setup;
  var rentOverride = document.getElementById('rentOverrideOn').checked;
  var haveOverrideVal = +document.getElementById('rentOverride').value || 0;

  var housingRangeLow = 0, housingRangeHigh = 0;
  if(calcPath === 'solo'){
    if(rentOverride){
      housingRangeLow = haveOverrideVal;
      housingRangeHigh = haveOverrideVal;
    } else {
      var area = document.getElementById('area').value;
      var sharing = document.getElementById('sharing').value;
      var range = EGYPT_COST_DATA.housing[area][sharing];
      housingRangeLow = range[0];
      housingRangeHigh = range[2];
    }
  }
  // Deposit + first month rent — skip for family (handled outside this student's setup cost)
  var depositLow = calcPath==='family' ? 0 : housingRangeLow * 2;
  var depositHigh = calcPath==='family' ? 0 : housingRangeHigh * 2;

  var low = depositLow + d.simSetup[0] + d.householdItems[0] + d.initialGroceries[0] + d.arrivalTransport[0] + d.booksMaterials[0] + d.entryVisa[0];
  var high = depositHigh + d.simSetup[1] + d.householdItems[1] + d.initialGroceries[1] + d.arrivalTransport[1] + d.booksMaterials[1] + d.entryVisa[1];

  return { low: low, high: high };
}

function updateCalc(){
  var cur = document.getElementById('calcCur').value;
  var months = +document.getElementById('dur').value;
  document.getElementById('durLbl').textContent = months + (months>1?' months':' month');
  document.getElementById('r-durLbl').textContent = months + (months>1?' months':' month');

  // Show/hide Qurʾān private-teacher assumption note
  var quranVal = document.getElementById('quranStudy').value;
  document.getElementById('quranPrivateNote').style.display = (quranVal==='private') ? 'block' : 'none';

  var b = computeBudget(calcTier);

  document.getElementById('r-accom').textContent    = fmtEGP(b.housing, cur) + '/mo';
  document.getElementById('r-food').textContent      = fmtEGP(b.food, cur) + '/mo';
  document.getElementById('r-transport').textContent = fmtEGP(b.transport, cur) + '/mo';
  document.getElementById('r-mobile').textContent    = fmtEGP(b.mobile, cur) + '/mo';
  document.getElementById('r-arabic').textContent    = fmtEGP(b.arabic, cur) + '/mo';
  document.getElementById('r-quran').textContent     = fmtEGP(b.quran, cur) + '/mo';
  document.getElementById('r-personal').textContent  = fmtEGP(b.personal, cur) + '/mo';
  document.getElementById('r-social').textContent    = fmtEGP(b.social, cur) + '/mo';
  document.getElementById('r-buffer').textContent    = fmtEGP(b.buffer, cur) + '/mo';

  document.getElementById('r-monthly').textContent = fmtEGP(b.monthly, cur);
  document.getElementById('r-weekly').textContent  = fmtEGP(b.monthly * 12 / 52, cur);
  document.getElementById('r-daily').textContent   = fmtEGP(b.monthly * 12 / 365, cur);
  document.getElementById('r-total').textContent   = fmtEGP(b.monthly * months, cur);

  var includeSetup = document.getElementById('includeSetup').checked;
  var setupBox = document.getElementById('setupBox');
  if(includeSetup){
    var s = computeSetup();
    setupBox.style.display = 'block';
    document.getElementById('r-setup').textContent = fmtEGP(s.low, cur) + ' – ' + fmtEGP(s.high, cur);
  } else {
    setupBox.style.display = 'none';
  }
}

// Toggle override input visibility
document.addEventListener('DOMContentLoaded', function(){
  var pairs = [['rentOverrideOn','rentOverride'],['arabicOverrideOn','arabicOverride'],['quranOverrideOn','quranOverride']];
  pairs.forEach(function(p){
    var chk=document.getElementById(p[0]), inp=document.getElementById(p[1]);
    if(chk && inp){
      chk.addEventListener('change', function(){ inp.style.display = chk.checked ? 'block' : 'none'; });
    }
  });
});

// Initialize calculator to default state on page load
if (document.getElementById('calcPaths')) setCalcPath('solo');

function updateProgress(){
  const all=document.querySelectorAll(".cl-item input"),done=document.querySelectorAll(".cl-item input:checked");
  document.getElementById("pTotal").textContent=all.length;
  document.getElementById("pDone").textContent=done.length;
  document.getElementById("pFill").style.width=(done.length/all.length*100)+"%";
}
if (document.querySelector('.cl-item')) updateProgress();

