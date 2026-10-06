// Single source of truth for workshop content. Loaded as a classic <script> by
// index.html and guide.html (exposes window.WorkshopContent) and via require() in tests.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorkshopContent = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const GUIDE_URL = 'https://anasakkari3.github.io/albayader-ai-guide/';

  const THREADS = [
    { id: 'role', name: 'الدور', question: 'مين بدك يكون؟' },
    { id: 'context', name: 'السياق', question: 'شو لازم يعرف عنك وعن وضعك؟' },
    { id: 'task', name: 'المهمة', question: 'شو بدك بالضبط؟' },
    { id: 'format', name: 'الشكل', question: 'كيف بدك الجواب؟' },
  ];

  const TOOLS = {
    chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com' },
    claude: { name: 'Claude', url: 'https://claude.ai' },
    gemini: { name: 'Gemini', url: 'https://gemini.google.com' },
    notebooklm: { name: 'NotebookLM', url: 'https://notebooklm.google.com' },
    perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai' },
    kimi: { name: 'Kimi', url: 'https://www.kimi.com' },
    openmontage: { name: 'OpenMontage', url: 'https://openmontage.video' },
  };

  const AGENDA = [
    { id: 'opening', title: 'الافتتاح', minutes: 6 },
    { id: 'threads', title: 'الخيوط الأربعة', minutes: 14 },
    { id: 'apps', title: 'سبع تطبيقات', minutes: 47 },
    { id: 'features', title: 'شو الجديد اللي ما بتعرفه', minutes: 10 },
    { id: 'ownership', title: 'الخيط اللي ما بتتركه', minutes: 8 },
    { id: 'closing', title: 'الختام', minutes: 5 },
  ];

  const GROUPS = [
    { id: 'apps', title: 'أوامر التطبيقات' },
    { id: 'creative', title: 'صور وبروشور وفيديو' },
    { id: 'features', title: 'الميزات الجديدة' },
  ];

  const PROMPTS = [
    {
      id: 'learning',
      group: 'apps',
      title: 'التعلّم',
      problem: 'عندك محاضرة طويلة أو موضوع صعب ومش عارف من وين تبلّش.',
      tools: ['notebooklm', 'gemini'],
      segments: {
        role: 'إنت مدرّس صبور.',
        context: 'بدي أفهم [الموضوع] ومستواي [مبتدئ/متوسط].',
        task: 'اشرحلي الفكرة خطوة خطوة بمثال من الحياة اليومية، وبعد كل فكرة اسألني سؤال لتتأكد إني فهمت.',
        format: 'فقرات قصيرة، ولا تعطيني الجواب مباشرة.',
      },
      tip: 'جرّب NotebookLM: ارفع محاضرتك واطلب ملخص وأسئلة اختبار وبودكاست صوتي عنها.',
    },
    {
      id: 'thoughts',
      group: 'apps',
      title: 'ترتيب الأفكار',
      problem: 'براسك أفكار كثيرة ومخربطة عن مشروع أو قرار.',
      tools: ['claude', 'gemini'],
      segments: {
        role: 'إنت مساعد بيرتّب الأفكار.',
        context: 'هاي أفكار حكيتها بشكل عشوائي عن [الموضوع]: [الصق النص].',
        task: 'رتّبها بدون ما تضيف أفكار من عندك.',
        format: 'ثلاث أقسام: الأفكار الرئيسية، الأسئلة المفتوحة، الخطوات الجاية.',
      },
      tip: 'احكي بالصوت بدل ما تكتب. الأدوات بتفهم الحكي المخربط.',
    },
    {
      id: 'cv',
      group: 'apps',
      title: 'CV ورسالة تقديم',
      problem: 'بتقدّم لوظيفة وبدك CV ورسالة على مقاس الإعلان.',
      tools: ['claude'],
      segments: {
        role: 'إنت مسؤول توظيف بخبرة 10 سنين.',
        context: 'هاد إعلان الوظيفة: [...] وهاد الـ CV تبعي: [...].',
        task: '(1) شو الفجوات؟ (2) عدّل صياغة الخبرات لتطابق الإعلان بدون ما تخترع إشي. (3) اكتب رسالة تقديم.',
        format: 'الفجوات بنقاط، والرسالة بـ 150 كلمة.',
      },
      tip: 'ممنوع يخترع خبرات أو شهادات. كل سطر بالـ CV لازم يكون صحيح.',
    },
    {
      id: 'plan',
      group: 'apps',
      title: 'من فكرة لخطة',
      problem: 'عندك فكرة مشروع وما بتعرف كيف تحوّلها لخطوات.',
      tools: ['claude', 'kimi'],
      segments: {
        role: 'إنت مستشار مشاريع صغيرة.',
        context: 'عندي فكرة: [...]. ميزانيتي ووقتي: [...].',
        task: 'قبل ما تعطيني أي خطة، اسألني 5 أسئلة مهمة، وحدة وحدة. بعدها اعطيني خطة 90 يوم.',
        format: 'جدول فيه: الأسبوع، المهمة، التكلفة التقريبية، الخطر.',
      },
      tip: 'تقنية "اسألني أول": خلّيه يسألك قبل ما يجاوب.',
    },
    {
      id: 'research',
      group: 'apps',
      title: 'البحث الأذكى',
      problem: 'بدك معلومة موثوقة، مش أول نتيجة بجوجل.',
      tools: ['perplexity'],
      segments: {
        role: 'إنت باحث دقيق.',
        context: 'بدي أعرف: [سؤالي].',
        task: 'اعطيني مصادر حديثة وموثوقة، وفرّق بين الحقائق والآراء.',
        format: 'نقاط قصيرة مع مصدر لكل نقطة، وقلّي إذا في معلومة مش متأكد منها.',
      },
      tip: 'افتح المصدر قبل ما تستخدم المعلومة.',
    },
    {
      id: 'work',
      group: 'apps',
      title: 'بالشغل',
      problem: 'إيميلات واجتماعات وجداول بتاكل وقتك.',
      tools: ['claude', 'gemini'],
      segments: {
        role: 'إنت موظف خدمة زبائن محترف.',
        context: 'هاد إيميل من زبون زعلان: [...]. وهاد اللي بنقدر نعمله: [...].',
        task: 'اكتب رد بيعتذر وبيقترح حل واضح.',
        format: 'النبرة: مهذبة وحازمة. الطول: 5 أسطر.',
      },
      tip: 'لا تحط بيانات حساسة، وراجع كل شي، وإنت اللي بتوقّع عليه.',
    },
    { id: 'logo', group: 'creative', title: 'شعار لمشروعك', problem: 'بدك شعار بسيط بدون مصمم.', tools: ['chatgpt'],
      segments: { role: 'إنت مصمم شعارات.', context: 'عندي كشك قهوة صغير قرب الجامعة اسمه «فنجان».',
        task: 'صمّملي شعار بسيط وحديث فيه فنجان قهوة وحرف ف.', format: 'لونين بس (كحلي وبيج)، خلفية بيضاء، مربع.' },
      tip: 'جرّب كذا مرة وغيّر الألوان والأسلوب لحد ما يعجبك.' },
    { id: 'brochure', group: 'creative', title: 'بروشور جاهز للطباعة', problem: 'بدك بروشور لمشروعك من الخطة اللي عملتها.', tools: ['claude'],
      segments: { role: 'إنت مصمم مطبوعات.', context: 'هاي خطة مشروعي: [الصق الخطة]. اسم الكشك «فنجان» وزبائنه طلاب.',
        task: 'اعملي بروشور صفحة وحدة: اسم، جملة تعريف، قائمة مشروبات مع أسعار، ساعات الدوام، وعرض افتتاح.',
        format: 'ملف جاهز للطباعة بحجم A5، ألوان كحلي وبيج، بالعربي.' },
      tip: 'اطلب ملف HTML أو PDF، واطبعه أو حوّله لصورة.' },
    { id: 'post', group: 'creative', title: 'صورة بوست', problem: 'بدك بوست سوشال ميديا لفعالية.', tools: ['chatgpt'],
      segments: { role: 'إنت مصمم سوشال ميديا.', context: 'عندنا فعالية نادي قراءة شبابي بالقدس، يوم الخميس الساعة 6 مساءً بالمكتبة العامة.',
        task: 'اعملي صورة بوست إنستغرام للفعالية فيها النص: «نادي القراءة – لقاؤنا الأول».',
        format: 'مربع، ألوان دافئة، كتب وفنجان شاي، خط عربي واضح.' },
      tip: 'تأكد من النص العربي بالصورة، وأحياناً لازم تعيد الطلب.' },
    { id: 'gemini-video', group: 'creative', title: 'فيديو من أمر نصي', problem: 'بدك فيديو قصير بدون تصوير.', tools: ['gemini'],
      segments: { role: 'إنت مخرج إعلانات.', context: 'بدي فيديو قصير لكشك قهوة اسمه «فنجان».',
        task: 'اعملي فيديو: لقطة قريبة لإيد بتصب قهوة بفنجان على طاولة خشب، والكاميرا بتتحرك ببطء لقدام.',
        format: '8 ثواني، إضاءة صباحية دافئة، أسلوب سينمائي.' },
      tip: 'وصف الكاميرا والإضاءة والمدة بيفرق كثير.' },
    { id: 'video-edit', group: 'creative', title: 'تعديل وإنتاج فيديو', problem: 'عندك صور أو مقاطع وبدك منها فيديو مرتّب.', tools: ['claude', 'openmontage'],
      segments: { role: 'إنت مونتير فيديو.', context: 'معي صورة بوستر ورشة فيها روبوت معلّق بخيوط، وعنوان الورشة «كيف تخلي الذكاء الاصطناعي يشتغل معك؟».',
        task: 'استخدم OpenMontage واعملي فيديو افتتاحية: الصورة بحركة زوم، بعدها جملتين، بعدها الخيوط الأربعة، بعدها العنوان.',
        format: '30 ثانية، ألوان البوستر (بيج وكحلي)، خط عربي واضح.' },
      tip: 'Claude بيكتب ويشغّل المونتاج، وإنت بتراجع وبتطلب تعديلات.' },
    { id: 'scheduled', group: 'features', title: 'مهمة مجدولة', problem: 'بدك تذكير أو ملخص بيوصلك لحاله.', tools: ['chatgpt', 'claude'],
      segments: { role: 'إنت مساعدي الشخصي.', context: 'بشتغل منسّق مشاريع، ومواعيدي بالتقويم.',
        task: 'كل يوم أحد الساعة 8 الصبح: رتّبلي مهام الأسبوع حسب الأولوية وذكّرني بالمواعيد المهمة.',
        format: 'رسالة قصيرة: 5 نقاط بالأكثر.' },
      tip: 'ابدأ بمهمة وحدة أسبوعية وشوف إذا بتفيدك.' },
    { id: 'computer', group: 'features', title: 'وكيل المتصفح', problem: 'مقارنة أسعار أو تعبئة نماذج بتاخد وقت.', tools: ['claude', 'chatgpt'],
      segments: { role: 'إنت مساعد حجوزات.', context: 'بدي غرفة لشخصين بعمّان، ليلتين من 20 لـ 22 نوفمبر، وميزانيتي محدودة.',
        task: 'افتح 3 مواقع حجز، وقارن أرخص 3 خيارات، ولا تحجز إشي.', format: 'جدول: الفندق، السعر لليلتين، التقييم، الرابط.' },
      tip: 'لا تخليه يدفع أو يرسل إشي بدون ما تراجع.' },
    { id: 'deep-research', group: 'features', title: 'بحث عميق', problem: 'بدك تقرير كامل بمصادر.', tools: ['gemini', 'chatgpt', 'perplexity'],
      segments: { role: 'إنت باحث.', context: 'بحضّر عرض عن [الموضوع] لجمهور شباب.',
        task: 'اعمل بحث عميق من مصادر متنوعة وحديثة.', format: 'تقرير بعناوين، ملخص بأول صفحة، وقائمة مصادر بالآخر.' },
      tip: 'افتح أهم المصادر وتأكد منها قبل ما تعتمد التقرير.' },
  ];

  const APPS = [
    { id: 'learning', num: '1', title: 'التعلّم', problem: 'عندك محاضرة طويلة أو موضوع صعب ومش عارف من وين تبلّش.', tools: ['notebooklm', 'gemini'], prompt: 'learning',
      steps: ['افتح NotebookLM وارفع ملف المحاضرة (PDF).', 'اطلب ملخص و5 أسئلة اختبار، واضغط Audio Overview للبودكاست.', 'للفهم أعمق: افتح Gemini والصق الأمر تحت.'] },
    { id: 'thoughts', num: '2', title: 'ترتيب الأفكار', problem: 'براسك أفكار كثيرة ومخربطة عن مشروع أو قرار.', tools: ['claude', 'gemini'], prompt: 'thoughts',
      steps: ['افتح Claude أو Gemini واضغط زر الميكروفون.', 'احكي أفكارك دقيقتين زي ما هي، بدون ترتيب.', 'الصق الأمر تحت.'] },
    { id: 'cv', num: '3', title: 'CV ورسالة تقديم', problem: 'بتقدّم لوظيفة وبدك CV ورسالة على مقاس الإعلان.', tools: ['claude'], prompt: 'cv',
      steps: ['افتح Claude وأرفق الـ CV وإعلان الوظيفة.', 'الصق الأمر تحت.', 'راجع كل سطر: لازم يكون صحيح عنك.'] },
    { id: 'plan', num: '4', title: 'من فكرة لخطة… لبروشور', problem: 'عندك فكرة مشروع وما بتعرف كيف تحوّلها لخطوات وتسوّق لها.', tools: ['claude', 'chatgpt'], prompt: 'plan',
      steps: ['افتح Claude والصق الأمر تحت، وجاوب على أسئلته وحدة وحدة.', 'بعد الخطة اطلب منه بروشور جاهز للطباعة (الأمر بالدليل).', 'للشعار: افتح ChatGPT والصق أمر الشعار من الدليل.'] },
    { id: 'research', num: '5', title: 'البحث الأذكى', problem: 'بدك معلومة موثوقة، مش أول نتيجة بجوجل.', tools: ['perplexity'], prompt: 'research',
      steps: ['افتح Perplexity والصق الأمر تحت.', 'افتح مصدرين على الأقل وتأكد إنهم بيحكوا نفس الشي.'] },
    { id: 'work', num: '6', title: 'بالشغل', problem: 'إيميلات واجتماعات وبوستات بتاكل وقتك.', tools: ['claude', 'chatgpt'], prompt: 'work',
      steps: ['افتح Claude والصق الإيميل مع الأمر تحت.', 'راجع الرد وعدّل اللي بدك قبل ما تبعته.', 'للبوست: الصق ملاحظات الاجتماع بـ ChatGPT واطلب صورة البوست (الأمر بالدليل).'] },
    { id: 'video', num: '7', title: 'فيديو', problem: 'بدك فيديو قصير لمشروعك أو فعاليتك، بدون كاميرا ولا مونتاج.', tools: ['gemini', 'claude', 'openmontage'], prompt: 'gemini-video',
      steps: ['لصناعة فيديو: افتح Gemini واختار Video، والصق الأمر تحت.', 'لتعديل وإنتاج فيديو: افتح Claude مع OpenMontage، وأعطيه صورك ووصف الفيديو (الأمر بالدليل).', 'استنى دقائق، وراجع النتيجة قبل ما تنشرها.'] },
  ];

  const FEATURES = [
    { id: 'scheduled', num: 'أ', title: 'المهام المجدولة', problem: 'بدك AI يشتغل لحاله بوقت محدد، بدون ما تفتحه كل مرة.', tools: ['chatgpt', 'claude'], prompt: 'scheduled',
      steps: ['افتح ChatGPT (Tasks) أو Claude (Scheduled tasks)، واربطه بتقويمك من الإعدادات (Connectors).', 'اكتب الأمر تحت وحدّد الوقت: كل أحد 8:00.', 'من هلأ، الرسالة بتوصلك لحالها.'] },
    { id: 'computer', num: 'ب', title: 'التحكم بالمتصفح والكمبيوتر', problem: 'مهام مملة بالمتصفح: مقارنة أسعار، تعبئة نماذج، ترتيب ملفات.', tools: ['claude', 'chatgpt'], prompt: 'computer',
      steps: ['افتح وكيل المتصفح: Claude in Chrome أو ChatGPT Agent.', 'الصق الأمر تحت، وراقبه وهو بيفتح المواقع.', 'ما بيدفع ولا بيحجز إلا إذا إنت وافقت.'] },
    { id: 'deep', num: 'ج', title: 'البحث العميق والمحادثة الصوتية', problem: 'بدك تقرير كامل من مصادر كثيرة، أو تسأل عن إشي قدامك.', tools: ['gemini', 'chatgpt', 'perplexity'], prompt: 'deep-research',
      steps: ['بـ Gemini أو ChatGPT أو Perplexity اختار Deep Research والصق الأمر تحت.', 'بياخد دقائق وبيقرأ عشرات المصادر. افتح أهمها وتأكد.', 'وكمان Gemini Live: احكي معه بالصوت ووجّه الكاميرا على أي إشي.'] },
  ];

  const EXAMPLES = {
    strongCv: {
      role: 'إنت مسؤول توظيف بخبرة 10 سنين.',
      context: 'أنا خريج إدارة أعمال، تطوعت سنة بجمعية شبابية، وبقدّم لوظيفة منسّق مشاريع. هاد الإعلان: [...] وهاد الـ CV تبعي: [...].',
      task: 'طلّعلي أهم الفجوات بين الـ CV والإعلان، واقترح صياغة أقوى بدون ما تخترع إشي.',
      format: 'نقاط قصيرة، وإذا ناقصك معلومة اسألني.',
    },
  };

  const OWNERSHIP_RULES = [
    { title: 'راجع', text: 'AI بيغلط، وأحياناً بيغلط بثقة. تأكد من الأرقام والأسماء والمصادر.' },
    { title: 'احمِ خصوصيتك', text: 'لا تحط أرقام هويات أو كلمات سر أو بيانات زبائن أو أي معلومة حساسة.' },
    { title: 'فكّر أول', text: 'اكتب رأيك أو مسودتك قبل ما تسأل، عشان يضل التفكير تفكيرك.' },
    { title: 'إنت بتوقّع', text: 'أي شي بتبعته أو بتقدّمه، إنت المسؤول عنه، مش الأداة.' },
  ];

  function promptParts(segments) {
    return THREADS.map((t) => ({ thread: t.id, name: t.name, text: segments[t.id] }));
  }

  function promptText(segments) {
    return promptParts(segments).map((p) => p.text).join(' ');
  }

  // Browser-only helper shared by deck.js and guide.js.
  function renderPromptInto(target, segments) {
    const doc = target.ownerDocument;
    target.textContent = '';
    for (const part of promptParts(segments)) {
      const seg = doc.createElement('span');
      seg.className = 'seg seg--' + part.thread;
      const tag = doc.createElement('b');
      tag.className = 'seg__tag';
      // Label is drawn by CSS (::before) so copying a prompt never picks it up.
      tag.setAttribute('data-label', part.name);
      const text = doc.createElement('span');
      text.className = 'seg__text';
      text.textContent = part.text;
      seg.append(tag, text);
      target.append(seg, doc.createTextNode(' '));
    }
  }

  // v1 chat texts; RESULTS below wraps them (and adds the new results).
  const DEMO_CHATS = {
    compare: {
      tool: 'Claude',
      messages: [
        { from: 'user', text: 'اكتبلي CV' },
        { from: 'ai', text: 'أكيد! هاد قالب CV:\nالاسم: [اسمك]\nالملخص: شخص طموح ومجتهد بحب التعلّم\nالخبرات: [اذكر خبراتك]\nالمهارات: التواصل، العمل الجماعي، إدارة الوقت' },
        { from: 'user', text: promptText(EXAMPLES.strongCv) },
        { from: 'ai', text: 'الفجوة الأهم: الإعلان بطلب خبرة بمتابعة الميزانيات، وإنت ما ذكرتها، مع إنه تطوعك فيه شغل قريب منها.\n\nصياغة مقترحة لسطر التطوع:\n• نسّقت [عدد] فعاليات شبابية، وتابعت ميزانية كل فعالية من التخطيط للتقرير النهائي.\n\nسؤال قبل ما أكمل: قديش كان عدد الفعاليات وحجم الميزانية تقريباً؟ بدي أكتب أرقامك الحقيقية، مش أرقام من عندي.' },
      ],
    },
    learning: {
      tool: 'NotebookLM',
      messages: [
        { from: 'user', text: '📄 مبادئ التسويق.pdf\nاعملي ملخص بنقاط، و5 أسئلة اختبار.' },
        { from: 'ai', text: 'الملخص:\n• التسويق هو فهم احتياج الزبون، مش بس الإعلان.\n• الاحتياج شعور بالنقص، والرغبة هي الشكل اللي بياخده.\n• المزيج التسويقي: المنتج، السعر، المكان، الترويج.\n• ما في منتج لكل الناس: اختار شريحتك.\n\nأسئلة اختبار:\n1. شو الفرق بين الاحتياج والرغبة؟\n2. أعطِ مثال على قرار "مكان" لمحل صغير.\n3. ليش ما في منتج بناسب الكل؟\n…\n\n🎧 جاهز كمان: Audio Overview، حوار صوتي عن المحاضرة.' },
      ],
    },
    thoughts: {
      tool: 'Claude',
      messages: [
        { from: 'user', text: '🎤 تسجيل صوتي (دقيقتين):\n"بدي أعمل نادي قراءة بالحارة… يمكن مرة بالأسبوع… لازم أسأل المكتبة إذا بنقدر نتلاقى عندهم… وكمان بدي إشي للصغار… بس مين بدو ينظّم؟ وكيف نختار الكتب؟"' },
        { from: 'ai', text: 'الأفكار الرئيسية:\n• نادي قراءة بالحارة، لقاء أسبوعي.\n• فقرة خاصة للأطفال.\n\nالأسئلة المفتوحة:\n• وين مكان اللقاء؟ المكتبة؟\n• مين بنظّم معك؟\n• كيف بتختاروا الكتب؟\n\nالخطوات الجاية:\n1. اسأل المكتبة عن إمكانية اللقاء عندهم.\n2. دوّر على شخصين يشاركوك التنظيم.' },
      ],
    },
    cv: {
      tool: 'Claude',
      messages: [
        { from: 'user', text: 'إنت مسؤول توظيف بخبرة 10 سنين. هاد إعلان وظيفة "مساعد إداري": [الإعلان] وهاد الـ CV تبعي: [الـ CV]. (1) شو الفجوات؟ (2) عدّل صياغة الخبرات بدون ما تخترع إشي. (3) اكتب رسالة تقديم.' },
        { from: 'ai', text: 'الفجوات:\n• الإعلان بطلب إتقان Excel، والـ CV ما بذكره. إذا بتستخدمه، ضيفه.\n• خبرتك بخدمة الزبائن مكتوبة بشكل عام.\n\nصياغة مقترحة:\n• بدل "عملت بخدمة الزبائن": "استقبلت استفسارات الزبائن يومياً وتابعت حلّها لحد النهاية."\n\nرسالة التقديم (بداية):\n"تحية طيبة وبعد، أتقدّم بطلبي لوظيفة مساعد إداري، إذ تمنحني خبرتي في خدمة الزبائن القدرة على…"' },
      ],
    },
    plan: {
      tool: 'Claude',
      messages: [
        { from: 'user', text: 'إنت مستشار مشاريع صغيرة. عندي فكرة: كشك قهوة صغير قرب الجامعة. قبل ما تعطيني أي خطة، اسألني 5 أسئلة مهمة، وحدة وحدة.' },
        { from: 'ai', text: 'سؤال 1 من 5: مين زبونك الأساسي؟ طلاب، موظفين، ولا الاثنين؟' },
        { from: 'user', text: 'طلاب بالأساس.' },
        { from: 'ai', text: 'سؤال 2 من 5: قديش الميزانية اللي بتقدر تبلّش فيها تقريباً؟' },
        { from: 'ai', text: '(بعد الأسئلة الخمسة)\n\nخطة 90 يوم:\nالأسبوع 1–2 | دراسة المكان والمنافسين | تكلفة قليلة | الخطر: المكان مش متاح\nالأسبوع 3–6 | الترخيص والتجهيز | حسب ميزانيتك | الخطر: تأخير الأوراق\nالأسبوع 7–8 | تجربة مع 20 طالب | قليلة | الخطر: السعر مش مناسب\nالأسبوع 9–12 | الافتتاح والتسويق | متوسطة | الخطر: إقبال ضعيف بالبداية' },
      ],
    },
    research: {
      tool: 'Perplexity',
      messages: [
        { from: 'user', text: 'شو أفضل طرق المذاكرة حسب الأبحاث؟ اعطيني مصادر موثوقة، وفرّق بين الحقائق والآراء.' },
        { from: 'ai', text: 'مدعوم بالأبحاث:\n• الاسترجاع: اختبر حالك بدل ما تعيد القراءة. [1][2]\n• التكرار المتباعد: وزّع المراجعة على كذا يوم. [2]\n\nشائع بس الدليل ضعيف:\n• التظليل بالألوان: مراجعة 2013 صنّفته "فائدة منخفضة". [2]\n\nالمصادر:\n[1] Roediger & Karpicke (2006), Psychological Science\n[2] Dunlosky et al. (2013), Psychological Science in the Public Interest' },
      ],
    },
    work: {
      tool: 'Claude',
      messages: [
        { from: 'user', text: 'إنت موظف خدمة زبائن محترف. هاد إيميل من زبون زعلان: "طلبيتي تأخرت أسبوع وما حدا ردّ عليّ!" وهاد اللي بنقدر نعمله: توصيل خلال يومين + خصم 10% على الطلبية الجاية. اكتب رد بيعتذر وبيقترح حل واضح. النبرة: مهذبة وحازمة. الطول: 5 أسطر.' },
        { from: 'ai', text: 'مرحباً [اسم الزبون]،\nبعتذر منك عن تأخير طلبيتك وعن تأخرنا بالرد، ومعك حق تكون منزعج.\nطلبيتك رح توصلك خلال يومين، وبنتابعها بأنفسنا لحد ما توصل.\nوتقديراً لصبرك، رح تحصل على خصم 10% على طلبيتك الجاية.\nإذا في أي إشي، أنا موجود على هاد الإيميل مباشرة.' },
      ],
    },
  };

  const chat = (id) => ({ kind: 'chat', messages: DEMO_CHATS[id].messages });
  const planChat = DEMO_CHATS.plan.messages;

  const RESULTS = {
    compare: { tool: 'Claude', items: [chat('compare')] },
    learning: { tool: 'NotebookLM', items: [chat('learning')] },
    thoughts: { tool: 'Claude', items: [chat('thoughts')] },
    cv: { tool: 'Claude', items: [chat('cv')] },
    plan: { tool: 'Claude · ChatGPT', items: [
      { kind: 'chat', messages: [planChat[0], planChat[1], planChat[4]] },
      { kind: 'image', src: 'results/brochure.png', caption: 'Claude: بروشور جاهز للطباعة' },
      { kind: 'image', src: 'results/logo.png', caption: 'ChatGPT: شعار «فنجان»', pending: true },
    ] },
    research: { tool: 'Perplexity', items: [chat('research')] },
    work: { tool: 'Claude · ChatGPT', items: [
      chat('work'),
      { kind: 'image', src: 'results/post.png', caption: 'ChatGPT: بوست الفعالية', pending: true },
    ] },
    video: { tool: 'Gemini · Claude + OpenMontage', items: [
      { kind: 'video', src: 'results/gemini-video.mp4', caption: 'Gemini: فيديو من أمر نصي', pending: true },
      { kind: 'video', src: 'assets/videos/opening.mp4', caption: 'Claude + OpenMontage: فيديو افتتاحية الورشة' },
    ] },
    scheduled: { tool: 'ChatGPT · Tasks', items: [{ kind: 'chat', messages: [
      { from: 'user', text: 'كل يوم أحد الساعة 8 الصبح: رتّبلي مهام الأسبوع حسب الأولوية وذكّرني بالمواعيد المهمة. رسالة قصيرة: 5 نقاط بالأكثر.' },
      { from: 'ai', text: '🗓️ الأحد 8:00 · وصلتك لحالها (مثال توضيحي)\n\nمهام الأسبوع حسب الأولوية:\n1. تسليم تقرير المشروع (الثلاثاء)\n2. اجتماع الفريق (الأربعاء 10:00)\n3. الرد على إيميلات الشركاء\n4. تحضير ميزانية الشهر\n5. ساعة تعلّم يوم الخميس' },
    ] }] },
    computer: { tool: 'Claude in Chrome', items: [{ kind: 'chat', messages: [
      { from: 'user', text: 'بدي غرفة لشخصين بعمّان، ليلتين من 20 لـ 22 نوفمبر. افتح 3 مواقع حجز، وقارن أرخص 3 خيارات، ولا تحجز إشي.' },
      { from: 'ai', text: '🖱️ فتحت 3 مواقع حجز وقارنت (مثال توضيحي):\n\nالفندق | ليلتين | التقييم\nفندق أ | 95 دينار | 8.4\nفندق ب | 110 دينار | 8.9\nفندق ج | 120 دينار | 9.1\n\nما حجزت إشي. بدك أكمل بواحد منهم؟' },
    ] }] },
    deep: { tool: 'Gemini', items: [{ kind: 'chat', messages: [
      { from: 'user', text: 'Deep Research: بحضّر عرض عن الذكاء الاصطناعي وسوق العمل لجمهور شباب. اعمل بحث عميق من مصادر متنوعة وحديثة.' },
      { from: 'ai', text: '📑 التقرير جاهز (بعد قراءة عشرات المصادر):\n1. ملخص بصفحة\n2. الوظائف اللي بتتغيّر\n3. المهارات المطلوبة\n4. فرص للشباب\n5. توصيات\n+ قائمة مصادر مع روابط' },
      { from: 'user', text: '🎤📷 Gemini Live (الكاميرا على نبتة): ليش أوراقها صفرا؟' },
      { from: 'ai', text: 'الاصفرار مع تربة مبلولة غالباً سببه كثرة السقاية. خلّي التربة تنشف قبل السقاية الجاية، وتأكد إنه في فتحة تصريف بالأصيص.' },
    ] }] },
  };

  return { GUIDE_URL, THREADS, TOOLS, AGENDA, GROUPS, PROMPTS, APPS, FEATURES, RESULTS, EXAMPLES, OWNERSHIP_RULES, promptParts, promptText, renderPromptInto };
});
