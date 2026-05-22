$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    var dropdowns = document.getElementsByClassName('dropdown');
    for (let dropdown of dropdowns) {
        dropdown.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            dropdown.classList.toggle('is-active');
        });
    }

    // create the leaderboard if Tabulator is available
    if (typeof Tabulator !== 'undefined' && document.querySelector("#score-table")) {
        let leaderboard = new Tabulator("#score-table", {
            data:score_table, //assign data to table
            layout:"fitDataTable",
            // layout:"fitColumns",
            initialSort:[
                {column:"ALL", dir:"desc"}, //sort by this first
            ],
            autoColumns:true, //create columns from data field names
        });
    }

    const rankingCanvas = document.getElementById('overallRankingChart');
    if (rankingCanvas && typeof Chart !== 'undefined') {
        const rankingData = [
            { model: 'O3', source: 'closed', company: 'OpenAI', logoKey: 'openai', metrics: { fka: { p: 0.608, r: 0.775, f1: 0.641 }, lsa: { p: 0.366, r: 0.541, f1: 0.412 }, emr: { p: 0.565, r: 0.745, f1: 0.611 }, rda: { p: 0.424, r: 0.553, f1: 0.422 }, pae: { p: 0.579, r: 0.733, f1: 0.609 }, overall: { p: 0.567, r: 0.733, f1: 0.601 } } },
            { model: 'GPT-5', source: 'closed', company: 'OpenAI', logoKey: 'openai', metrics: { fka: { p: 0.544, r: 0.799, f1: 0.594 }, lsa: { p: 0.317, r: 0.563, f1: 0.373 }, emr: { p: 0.543, r: 0.801, f1: 0.608 }, rda: { p: 0.418, r: 0.523, f1: 0.426 }, pae: { p: 0.581, r: 0.742, f1: 0.623 }, overall: { p: 0.529, r: 0.760, f1: 0.578 } } },
            { model: 'Claude-Sonnet-4.5-Thinking', source: 'closed', company: 'Anthropic', logoKey: 'claude', metrics: { fka: { p: 0.519, r: 0.752, f1: 0.580 }, lsa: { p: 0.282, r: 0.411, f1: 0.317 }, emr: { p: 0.539, r: 0.700, f1: 0.578 }, rda: { p: 0.354, r: 0.489, f1: 0.356 }, pae: { p: 0.526, r: 0.663, f1: 0.539 }, overall: { p: 0.503, r: 0.692, f1: 0.546 } } },
            { model: 'Gemini-2.5-Pro', source: 'closed', company: 'Google', logoKey: 'gemini', metrics: { fka: { p: 0.505, r: 0.780, f1: 0.570 }, lsa: { p: 0.338, r: 0.479, f1: 0.369 }, emr: { p: 0.480, r: 0.726, f1: 0.535 }, rda: { p: 0.389, r: 0.592, f1: 0.408 }, pae: { p: 0.521, r: 0.677, f1: 0.555 }, overall: { p: 0.483, r: 0.726, f1: 0.536 } } },
            { model: 'Grok-4', source: 'closed', company: 'xAI', logoKey: 'grok', metrics: { fka: { p: 0.633, r: 0.614, f1: 0.570 }, lsa: { p: 0.321, r: 0.267, f1: 0.224 }, emr: { p: 0.665, r: 0.588, f1: 0.577 }, rda: { p: 0.326, r: 0.392, f1: 0.300 }, pae: { p: 0.598, r: 0.549, f1: 0.540 }, overall: { p: 0.600, r: 0.568, f1: 0.533 } } },
            { model: 'Gemini-2.5-Flash', source: 'closed', company: 'Google', logoKey: 'gemini', metrics: { fka: { p: 0.439, r: 0.816, f1: 0.530 }, lsa: { p: 0.294, r: 0.550, f1: 0.366 }, emr: { p: 0.424, r: 0.831, f1: 0.529 }, rda: { p: 0.410, r: 0.617, f1: 0.436 }, pae: { p: 0.431, r: 0.705, f1: 0.495 }, overall: { p: 0.427, r: 0.783, f1: 0.512 } } },
            { model: 'Gemini-2.0-Flash-Thinking', source: 'closed', company: 'Google', logoKey: 'gemini', metrics: { fka: { p: 0.646, r: 0.495, f1: 0.509 }, lsa: { p: 0.342, r: 0.260, f1: 0.267 }, emr: { p: 0.667, r: 0.437, f1: 0.466 }, rda: { p: 0.448, r: 0.338, f1: 0.332 }, pae: { p: 0.656, r: 0.440, f1: 0.468 }, overall: { p: 0.625, r: 0.450, f1: 0.468 } } },
            { model: 'GPT-4o', source: 'closed', company: 'OpenAI', logoKey: 'openai', metrics: { fka: { p: 0.616, r: 0.346, f1: 0.386 }, lsa: { p: 0.308, r: 0.095, f1: 0.117 }, emr: { p: 0.619, r: 0.318, f1: 0.374 }, rda: { p: 0.429, r: 0.311, f1: 0.323 }, pae: { p: 0.592, r: 0.323, f1: 0.370 }, overall: { p: 0.587, r: 0.323, f1: 0.367 } } },
            { model: 'GPT-4o-mini', source: 'closed', company: 'OpenAI', logoKey: 'openai', metrics: { fka: { p: 0.550, r: 0.312, f1: 0.346 }, lsa: { p: 0.266, r: 0.063, f1: 0.078 }, emr: { p: 0.489, r: 0.222, f1: 0.258 }, rda: { p: 0.302, r: 0.212, f1: 0.211 }, pae: { p: 0.572, r: 0.309, f1: 0.351 }, overall: { p: 0.501, r: 0.268, f1: 0.299 } } },
            { model: 'Qwen3-VL-235B-A22B-Thinking', source: 'open', company: 'Qwen', logoKey: 'qwen', metrics: { fka: { p: 0.594, r: 0.641, f1: 0.567 }, lsa: { p: 0.369, r: 0.406, f1: 0.347 }, emr: { p: 0.585, r: 0.655, f1: 0.578 }, rda: { p: 0.368, r: 0.484, f1: 0.355 }, pae: { p: 0.549, r: 0.553, f1: 0.518 }, overall: { p: 0.558, r: 0.615, f1: 0.538 } } },
            { model: 'Qwen3-VL-32B-Thinking', source: 'open', company: 'Qwen', logoKey: 'qwen', metrics: { fka: { p: 0.544, r: 0.658, f1: 0.554 }, lsa: { p: 0.334, r: 0.237, f1: 0.230 }, emr: { p: 0.544, r: 0.619, f1: 0.547 }, rda: { p: 0.392, r: 0.505, f1: 0.390 }, pae: { p: 0.561, r: 0.577, f1: 0.538 }, overall: { p: 0.525, r: 0.612, f1: 0.525 } } },
            { model: 'DeepSeek-R1', source: 'open', company: 'DeepSeek', logoKey: 'deepseek', metrics: { fka: { p: 0.517, r: 0.694, f1: 0.551 }, lsa: { p: 0.197, r: 0.152, f1: 0.136 }, emr: { p: 0.449, r: 0.607, f1: 0.480 }, rda: { p: 0.335, r: 0.377, f1: 0.329 }, pae: { p: 0.483, r: 0.476, f1: 0.427 }, overall: { p: 0.466, r: 0.600, f1: 0.484 } } },
            { model: 'Intern-S1', source: 'open', company: 'InternLM', logoKey: 'internlm', metrics: { fka: { p: 0.563, r: 0.539, f1: 0.468 }, lsa: { p: 0.311, r: 0.264, f1: 0.249 }, emr: { p: 0.589, r: 0.416, f1: 0.403 }, rda: { p: 0.389, r: 0.368, f1: 0.304 }, pae: { p: 0.580, r: 0.502, f1: 0.476 }, overall: { p: 0.548, r: 0.473, f1: 0.427 } } },
            { model: 'Qwen2.5-VL-72B-Instruct', source: 'open', company: 'Qwen', logoKey: 'qwen', metrics: { fka: { p: 0.607, r: 0.321, f1: 0.370 }, lsa: { p: 0.298, r: 0.107, f1: 0.144 }, emr: { p: 0.567, r: 0.264, f1: 0.312 }, rda: { p: 0.323, r: 0.245, f1: 0.245 }, pae: { p: 0.612, r: 0.373, f1: 0.402 }, overall: { p: 0.559, r: 0.295, f1: 0.337 } } },
            { model: 'DeepSeek-VL2', source: 'open', company: 'DeepSeek', logoKey: 'deepseek', metrics: { fka: { p: 0.373, r: 0.129, f1: 0.158 }, lsa: { p: 0.310, r: 0.024, f1: 0.036 }, emr: { p: 0.350, r: 0.080, f1: 0.101 }, rda: { p: 0.216, r: 0.124, f1: 0.138 }, pae: { p: 0.388, r: 0.102, f1: 0.122 }, overall: { p: 0.350, r: 0.108, f1: 0.132 } } }
        ];

        const rankingState = {
            filter: 'all',
            sort: 'desc',
            metric: 'overall',
            stat: 'f1'
        };

        const metricLabels = {
            overall: 'Overall',
            fka: 'FKA',
            lsa: 'LSA',
            emr: 'EMR',
            rda: 'RDA',
            pae: 'PAE'
        };

        const statLabels = {
            p: 'Precision',
            r: 'Recall',
            f1: 'F1'
        };

        const sourceColors = {
            closed: 'rgba(31, 74, 168, 0.85)',
            open: 'rgba(55, 125, 78, 0.85)'
        };

        const logoSources = {
            openai: './static/logo/openai-old-logo.png',
            claude: './static/logo/Claude_AI_symbol.png',
            gemini: './static/logo/Gemini-logo.png',
            grok: './static/logo/Grok.png',
            qwen: './static/logo/Qwen_logo.png',
            deepseek: './static/logo/Deepseek-logo-icon.png',
            internlm: './static/logo/internlm-icon-logo-png_seeklogo-611649.png'
        };

        const logoImages = {};
        let loadedLogoCount = 0;
        const totalLogos = Object.keys(logoSources).length;

        function notifyLogoLoaded() {
            loadedLogoCount += 1;
            if (loadedLogoCount >= totalLogos && rankingChart) {
                rankingChart.update();
            }
        }

        Object.entries(logoSources).forEach(([key, src]) => {
            const img = new Image();
            img.onload = notifyLogoLoaded;
            img.onerror = notifyLogoLoaded;
            img.src = src;
            logoImages[key] = img;
        });

        const logoHeightMap = {
            openai: 27,
            gemini: 33,
            default: 27
        };

        const valueLabelPlugin = {
            id: 'valueLabelPlugin',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                const items = chart.$rankingItems || [];
                ctx.save();
                ctx.fillStyle = '#1f2937';
                ctx.font = '14px sans-serif';
                chart.getDatasetMeta(0).data.forEach((bar, index) => {
                    const value = chart.data.datasets[0].data[index];
                    const textX = bar.x + 10;
                    ctx.fillText(value.toFixed(2), textX, bar.y + 5);

                    const item = items[index];
                    if (!item) return;
                    const logo = logoImages[item.logoKey];
                    if (logo && logo.complete) {
                        const targetHeight = logoHeightMap[item.logoKey] || logoHeightMap.default;
                        const aspectRatio = logo.naturalWidth / logo.naturalHeight || 1;
                        const drawWidth = targetHeight * aspectRatio;
                        const logoX = textX + 44;
                        const logoY = bar.y - targetHeight / 2;
                        ctx.drawImage(logo, logoX, logoY, drawWidth, targetHeight);
                    }
                });
                ctx.restore();
            }
        };

        let rankingChart = null;

        function getFilteredRankingData() {
            let filtered = rankingData.slice();
            if (rankingState.filter !== 'all') {
                filtered = filtered.filter(item => item.source === rankingState.filter);
            }
            filtered.sort((a, b) => rankingState.sort === 'desc'
                ? b.metrics[rankingState.metric][rankingState.stat] - a.metrics[rankingState.metric][rankingState.stat]
                : a.metrics[rankingState.metric][rankingState.stat] - b.metrics[rankingState.metric][rankingState.stat]);
            return filtered;
        }

        function updateRankingSummary(items) {
            const summary = document.getElementById('ranking-summary');
            if (!summary || !items.length) return;
            const best = items[rankingState.sort === 'desc' ? 0 : items.length - 1];
            const avg = items.reduce((sum, item) => sum + item.metrics[rankingState.metric][rankingState.stat], 0) / items.length;
            const sourceLabel = rankingState.filter === 'all'
                ? 'all models'
                : rankingState.filter === 'closed'
                    ? 'closed-source models'
                    : 'open-source models';
            summary.innerHTML = `<strong>${sourceLabel}</strong>: ${items.length} models, top <strong>${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]}</strong> from <strong>${best.model}</strong> (${best.metrics[rankingState.metric][rankingState.stat].toFixed(3)}), average <strong>${avg.toFixed(3)}</strong>.`;
        }

        function updateRankingCards() {
            const topModelEl = document.getElementById('ranking-top-model');
            const topModelSubEl = document.getElementById('ranking-top-model-subtext');
            const bestOpenEl = document.getElementById('ranking-best-open');
            const bestOpenSubEl = document.getElementById('ranking-best-open-subtext');
            const avgGapEl = document.getElementById('ranking-avg-gap');
            const avgGapSubEl = document.getElementById('ranking-avg-gap-subtext');
            const metricFocusEl = document.getElementById('ranking-metric-focus');
            const metricFocusSubEl = document.getElementById('ranking-metric-focus-subtext');

            const sortedAll = rankingData.slice().sort((a, b) => b.metrics[rankingState.metric][rankingState.stat] - a.metrics[rankingState.metric][rankingState.stat]);
            const bestOverall = sortedAll[0];
            const bestOpen = sortedAll.filter(item => item.source === 'open')[0];
            const closed = rankingData.filter(item => item.source === 'closed');
            const open = rankingData.filter(item => item.source === 'open');
            const closedAvg = closed.reduce((sum, item) => sum + item.metrics[rankingState.metric][rankingState.stat], 0) / closed.length;
            const openAvg = open.reduce((sum, item) => sum + item.metrics[rankingState.metric][rankingState.stat], 0) / open.length;
            const gap = closedAvg - openAvg;

            if (topModelEl) topModelEl.textContent = bestOverall.model;
            if (topModelSubEl) topModelSubEl.textContent = `${bestOverall.company} · ${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]} ${bestOverall.metrics[rankingState.metric][rankingState.stat].toFixed(3)}`;

            if (bestOpenEl) bestOpenEl.textContent = bestOpen.model;
            if (bestOpenSubEl) bestOpenSubEl.textContent = `${bestOpen.company} · ${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]} ${bestOpen.metrics[rankingState.metric][rankingState.stat].toFixed(3)}`;

            if (avgGapEl) avgGapEl.textContent = `${gap >= 0 ? '+' : ''}${gap.toFixed(3)}`;
            if (avgGapSubEl) avgGapSubEl.textContent = `Closed avg ${closedAvg.toFixed(3)} vs Open avg ${openAvg.toFixed(3)}`;

            if (metricFocusEl) metricFocusEl.textContent = metricLabels[rankingState.metric];
            if (metricFocusSubEl) metricFocusSubEl.textContent = `Ranking is currently sorted by ${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]}`;
        }

        function renderRankingChart() {
            const items = getFilteredRankingData();
            updateRankingSummary(items);
            updateRankingCards();

            const labels = items.map(item => item.model);
            const values = items.map(item => item.metrics[rankingState.metric][rankingState.stat]);
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const span = Math.max(maxValue - minValue, 1e-6);

            function getTierColors(value) {
                const normalized = (value - minValue) / span;
                if (normalized >= 0.90) {
                    return {
                        fill: 'rgba(245, 158, 11, 0.92)',
                        border: 'rgba(245, 158, 11, 1)'
                    };
                }
                if (normalized >= 0.50) {
                    return {
                        fill: 'rgba(156, 163, 175, 0.92)',
                        border: 'rgba(156, 163, 175, 1)'
                    };
                }
                return {
                    fill: 'rgba(180, 83, 9, 0.90)',
                    border: 'rgba(180, 83, 9, 1)'
                };
            }

            const colors = values.map(value => getTierColors(value).fill);
            const borderColors = values.map(value => getTierColors(value).border);

            if (rankingChart) {
                rankingChart.destroy();
            }

            rankingChart = new Chart(rankingCanvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: `${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]}`,
                        data: values,
                        backgroundColor: colors,
                        borderColor: borderColors,
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: 22
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    animation: {
                        duration: 450
                    },
                    scales: {
                        x: {
                            min: 0,
                            max: 0.85,
                            title: {
                                display: true,
                                text: `${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]}`,
                                font: {
                                    size: 14
                                }
                            },
                            ticks: {
                                font: {
                                    size: 13
                                }
                            },
                            grid: {
                                color: 'rgba(148, 163, 184, 0.2)'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                autoSkip: false,
                                font: {
                                    size: 15,
                                    weight: '600'
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const item = items[context.dataIndex];
                                    const source = item.source === 'closed' ? 'Closed-source' : 'Open-source';
                                    return [`${metricLabels[rankingState.metric]} ${statLabels[rankingState.stat]}: ${item.metrics[rankingState.metric][rankingState.stat].toFixed(3)}`, `Type: ${source}`, `Company: ${item.company}`];
                                }
                            }
                        }
                    }
                },
                plugins: [valueLabelPlugin]
            });
            rankingChart.$rankingItems = items;
            rankingChart.update();
        }

        function updateRankingButtons() {
            document.querySelectorAll('.ranking-btn[data-filter]').forEach(button => {
                button.classList.toggle('is-active', button.dataset.filter === rankingState.filter);
            });
            document.querySelectorAll('.ranking-btn[data-sort]').forEach(button => {
                button.classList.toggle('is-active', button.dataset.sort === rankingState.sort);
            });
            document.querySelectorAll('.ranking-btn[data-metric]').forEach(button => {
                button.classList.toggle('is-active', button.dataset.metric === rankingState.metric);
            });
            document.querySelectorAll('.ranking-btn[data-stat]').forEach(button => {
                button.classList.toggle('is-active', button.dataset.stat === rankingState.stat);
            });
        }

        document.querySelectorAll('.ranking-btn[data-filter]').forEach(button => {
            button.addEventListener('click', function() {
                rankingState.filter = this.dataset.filter;
                updateRankingButtons();
                renderRankingChart();
            });
        });

        document.querySelectorAll('.ranking-btn[data-sort]').forEach(button => {
            button.addEventListener('click', function() {
                rankingState.sort = this.dataset.sort;
                updateRankingButtons();
                renderRankingChart();
            });
        });

        document.querySelectorAll('.ranking-btn[data-metric]').forEach(button => {
            button.addEventListener('click', function() {
                rankingState.metric = this.dataset.metric;
                updateRankingButtons();
                renderRankingChart();
            });
        });

        document.querySelectorAll('.ranking-btn[data-stat]').forEach(button => {
            button.addEventListener('click', function() {
                rankingState.stat = this.dataset.stat;
                updateRankingButtons();
                renderRankingChart();
            });
        });

        updateRankingButtons();
        renderRankingChart();
    }
})