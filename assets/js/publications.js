(function() {
	var yearlyCitations = [
		{ year: 2016, value: 20 },
		{ year: 2017, value: 45 },
		{ year: 2018, value: 106 },
		{ year: 2019, value: 152 },
		{ year: 2020, value: 172 },
		{ year: 2021, value: 252 },
		{ year: 2022, value: 362 },
		{ year: 2023, value: 300 },
		{ year: 2024, value: 401 },
		{ year: 2025, value: 455 },
		{ year: 2026, value: 208 }
	];

	var publicationOutput = [
		{ year: 2015, value: 1 },
		{ year: 2017, value: 4 },
		{ year: 2018, value: 1 },
		{ year: 2020, value: 5 },
		{ year: 2021, value: 4 },
		{ year: 2022, value: 7 },
		{ year: 2023, value: 1 },
		{ year: 2024, value: 1 },
		{ year: 2025, value: 2 },
		{ year: 2026, value: 2 }
	];

	var cumulativeCitations = yearlyCitations.reduce(function(points, item) {
		var previous = points.length ? points[points.length - 1].value : 0;
		points.push({ year: item.year, value: previous + item.value });
		return points;
	}, []);

	var graphConfig = {
		'cumulative-citations': {
			title: 'Cumulative citation count per year',
			type: 'line',
			data: cumulativeCitations,
			note: 'Citation data from public Google Scholar profile, accessed May 27, 2026.'
		},
		'yearly-citations': {
			title: 'Citations by year',
			type: 'bar',
			data: yearlyCitations,
			note: 'Yearly citation counts from public Google Scholar profile, accessed May 27, 2026.'
		},
		'publication-output': {
			title: 'Publication output by year',
			type: 'bar',
			data: publicationOutput,
			note: 'Publication counts are based on the publications listed on this page.'
		}
	};

	function createSvgElement(name, attrs) {
		var element = document.createElementNS('http://www.w3.org/2000/svg', name);
		Object.keys(attrs || {}).forEach(function(key) {
			element.setAttribute(key, attrs[key]);
		});
		return element;
	}

	function niceMax(value) {
		if (value <= 10)
			return Math.ceil(value);

		var magnitude = Math.pow(10, Math.floor(Math.log10(value)));
		return Math.ceil(value / magnitude) * magnitude;
	}

	function renderChart(container, graphName) {
		var config = graphConfig[graphName] || graphConfig['cumulative-citations'];
		var svg = container.querySelector('svg');
		var title = container.querySelector('#active-graph-title');
		var note = container.querySelector('#graph-description');
		var data = config.data;
		var width = 640;
		var height = 320;
		var padding = { top: 24, right: 24, bottom: 54, left: 58 };
		var chartWidth = width - padding.left - padding.right;
		var chartHeight = height - padding.top - padding.bottom;
		var maxValue = niceMax(Math.max.apply(null, data.map(function(item) { return item.value; })));
		var yTicks = [0, maxValue / 2, maxValue];

		title.textContent = config.title;
		note.textContent = config.note;
		svg.innerHTML = '';

		yTicks.forEach(function(tick) {
			var y = padding.top + chartHeight - ((tick / maxValue) * chartHeight);

			svg.appendChild(createSvgElement('line', {
				class: 'graph-gridline',
				x1: padding.left,
				x2: width - padding.right,
				y1: y,
				y2: y
			}));

			svg.appendChild(createSvgElement('text', {
				class: 'graph-axis-label',
				x: padding.left - 12,
				y: y + 4,
				'text-anchor': 'end'
			})).textContent = Math.round(tick).toLocaleString();
		});

		svg.appendChild(createSvgElement('line', {
			class: 'graph-axis',
			x1: padding.left,
			x2: width - padding.right,
			y1: padding.top + chartHeight,
			y2: padding.top + chartHeight
		}));

		if (config.type === 'bar') {
			var gap = 10;
			var barWidth = (chartWidth - gap * (data.length - 1)) / data.length;

			data.forEach(function(item, index) {
				var x = padding.left + index * (barWidth + gap);
				var barHeight = (item.value / maxValue) * chartHeight;
				var y = padding.top + chartHeight - barHeight;

				svg.appendChild(createSvgElement('rect', {
					class: 'graph-bar',
					x: x,
					y: y,
					width: barWidth,
					height: Math.max(barHeight, 2),
					rx: 7
				}));

				svg.appendChild(createSvgElement('text', {
					class: 'graph-value',
					x: x + barWidth / 2,
					y: y - 8,
					'text-anchor': 'middle'
				})).textContent = item.value.toLocaleString();
			});
		}
		else {
			var points = data.map(function(item, index) {
				var x = padding.left + (index / (data.length - 1)) * chartWidth;
				var y = padding.top + chartHeight - ((item.value / maxValue) * chartHeight);
				return { x: x, y: y, item: item };
			});

			var linePath = points.map(function(point, index) {
				return (index === 0 ? 'M' : 'L') + point.x + ' ' + point.y;
			}).join(' ');

			svg.appendChild(createSvgElement('path', {
				class: 'graph-line',
				d: linePath
			}));

			points.forEach(function(point) {
				svg.appendChild(createSvgElement('circle', {
					class: 'graph-point',
					cx: point.x,
					cy: point.y,
					r: 5
				}));
			});

			points.filter(function(point, index) {
				return index === 0 || index === points.length - 1 || index % 2 === 0;
			}).forEach(function(point) {
				svg.appendChild(createSvgElement('text', {
					class: 'graph-value',
					x: point.x,
					y: point.y - 12,
					'text-anchor': 'middle'
				})).textContent = point.item.value.toLocaleString();
			});
		}

		data.forEach(function(item, index) {
			var x = config.type === 'bar'
				? padding.left + index * (chartWidth / data.length) + (chartWidth / data.length) / 2
				: padding.left + (index / (data.length - 1)) * chartWidth;

			svg.appendChild(createSvgElement('text', {
				class: 'graph-year',
				x: x,
				y: height - 18,
				'text-anchor': 'middle'
			})).textContent = item.year;
		});
	}

	document.addEventListener('DOMContentLoaded', function() {
		document.querySelectorAll('.graph-switcher').forEach(function(container) {
			var controls = container.querySelectorAll('[data-graph]');
			var defaultGraph = container.getAttribute('data-default-graph') || 'cumulative-citations';

			controls.forEach(function(button) {
				button.addEventListener('click', function() {
					controls.forEach(function(control) {
						control.classList.toggle('active', control === button);
					});

					renderChart(container, button.getAttribute('data-graph'));
				});
			});

			renderChart(container, defaultGraph);
		});
	});
})();
