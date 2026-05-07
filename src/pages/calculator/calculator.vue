<template>
	<view class="calculator-container">
		<!-- 结果显示区 -->
		<view class="display-card">
			<text class="display-text">{{ displayValue || '0' }}</text>
		</view>
		
		<!-- 按钮区 -->
		<view class="button-grid">
			<!-- 第一行：C, ←, %, ÷ -->
			<view class="grid-row">
				<view class="grid-item func-btn" @click="clearAll">C</view>
				<view class="grid-item func-btn" @click="backspace">←</view>
				<view class="grid-item func-btn" @click="inputOperator('%')">%</view>
				<view class="grid-item operator-btn" @click="inputOperator('/')">÷</view>
			</view>
			<!-- 第二行：7, 8, 9, × -->
			<view class="grid-row">
				<view class="grid-item number-btn" @click="inputNumber('7')">7</view>
				<view class="grid-item number-btn" @click="inputNumber('8')">8</view>
				<view class="grid-item number-btn" @click="inputNumber('9')">9</view>
				<view class="grid-item operator-btn" @click="inputOperator('*')">×</view>
			</view>
			<!-- 第三行：4, 5, 6, - -->
			<view class="grid-row">
				<view class="grid-item number-btn" @click="inputNumber('4')">4</view>
				<view class="grid-item number-btn" @click="inputNumber('5')">5</view>
				<view class="grid-item number-btn" @click="inputNumber('6')">6</view>
				<view class="grid-item operator-btn" @click="inputOperator('-')">−</view>
			</view>
			<!-- 第四行：1, 2, 3, + -->
			<view class="grid-row">
				<view class="grid-item number-btn" @click="inputNumber('1')">1</view>
				<view class="grid-item number-btn" @click="inputNumber('2')">2</view>
				<view class="grid-item number-btn" @click="inputNumber('3')">3</view>
				<view class="grid-item operator-btn" @click="inputOperator('+')">+</view>
			</view>
			<!-- 第五行：0, ., = -->
			<view class="grid-row">
				<view class="grid-item number-btn double-width" @click="inputNumber('0')">0</view>
				<view class="grid-item number-btn" @click="inputDot">.</view>
				<view class="grid-item equals-btn" @click="calculate">=</view>
			</view>
		</view>
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref } from 'vue';
import FloatingHome from '@/components/FloatingHome.vue';

// 状态管理
const displayValue = ref('0');          // 当前显示的数字
const previousValue = ref(null);        // 之前输入的数字
const operator = ref(null);             // 当前运算符
const waitingForOperand = ref(false);   // 是否等待输入新数字

// 输入数字
const inputNumber = (num) => {
	if (waitingForOperand.value) {
		displayValue.value = num;
		waitingForOperand.value = false;
	} else {
		displayValue.value = displayValue.value === '0' ? num : displayValue.value + num;
	}
};

// 输入小数点
const inputDot = () => {
	if (waitingForOperand.value) {
		displayValue.value = '0.';
		waitingForOperand.value = false;
	} else if (!displayValue.value.includes('.')) {
		displayValue.value += '.';
	}
};

// 输入运算符
const inputOperator = (nextOperator) => {
	const currentValue = parseFloat(displayValue.value);

	if (previousValue.value === null) {
		previousValue.value = currentValue;
	} else if (operator.value) {
		const result = performCalculation(operator.value, previousValue.value, currentValue);
		displayValue.value = String(result);
		previousValue.value = result;
	}

	waitingForOperand.value = true;
	operator.value = nextOperator;
};

// 执行计算（处理浮点数精度）
const performCalculation = (op, a, b) => {
	switch (op) {
		case '+': return a + b;
		case '-': return a - b;
		case '*': return a * b;
		case '/': return b === 0 ? '错误' : a / b;
		case '%': return a % b;
		default: return b;
	}
};

// 等于号逻辑
const calculate = () => {
	const currentValue = parseFloat(displayValue.value);

	if (previousValue.value !== null && operator.value) {
		const result = performCalculation(operator.value, previousValue.value, currentValue);
		displayValue.value = String(result);
		previousValue.value = null;
		operator.value = null;
		waitingForOperand.value = true;
	}
};

// 清空
const clearAll = () => {
	displayValue.value = '0';
	previousValue.value = null;
	operator.value = null;
	waitingForOperand.value = false;
};

// 退格
const backspace = () => {
	if (!waitingForOperand.value) {
		displayValue.value = displayValue.value.slice(0, -1) || '0';
	}
};
</script>

<style lang="scss" scoped>
.calculator-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #1c1c1e; /* 深色背景，高对比度 */
	padding: $spacing-md;
}

.display-card {
	background-color: #2c2c2e;
	border-radius: 24rpx;
	padding: $spacing-lg;
	margin-bottom: $spacing-xl;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	min-height: 160rpx;
}

.display-text {
	font-size: 96rpx; /* 超大字体，方便阅读 */
	font-weight: bold;
	color: #ffffff;
	text-align: right;
	word-break: break-all;
}

.button-grid {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: $spacing-md;
}

.grid-row {
	display: flex;
	gap: $spacing-md;
	flex: 1;
}

.grid-item {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 24rpx;
	font-size: 56rpx; /* 按钮字体也很大 */
	font-weight: bold;
	box-shadow: 0 8rpx 12rpx rgba(0, 0, 0, 0.3);
	transition: all 0.1s ease;
	
	&.double-width {
		flex: 2;
	}
	
	&:active {
		opacity: 0.7;
		transform: scale(0.97);
	}
}

.number-btn {
	background-color: #505055;
	color: #ffffff;
}

.operator-btn, .equals-btn {
	background-color: #ff9f0a;
	color: #ffffff;
}

.func-btn {
	background-color: #8e8e93;
	color: #000000;
}

.equals-btn {
	background-color: #ff9f0a;
}
</style>