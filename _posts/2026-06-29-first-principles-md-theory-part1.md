---
layout: post
title: "第一性分子动力学理论分享(一)"
date: 2026-06-29
excerpt: "从薛定谔方程到 Born–Oppenheimer 与 Car–Parrinello 分子动力学"
---

> 副标题：从薛定谔方程到 Born–Oppenheimer 与 Car–Parrinello 分子动力学  
> 适用读者：具有物理化学、量子化学、统计力学或材料模拟基础的读者  
> 写作定位：严谨科普，不把第一性原理分子动力学讲成“黑箱动画”；尽量把近似、公式和物理含义放在同一个框架中说明。

---

## 目录

1. [为什么需要第一性原理分子动力学](#1-为什么需要第一性原理分子动力学)
2. [从完整电子—核运动方程出发](#2-从完整电子核运动方程出发)
3. [几类核心分子动力学方案](#3-几类核心分子动力学方案)
4. [力的计算：Hellmann–Feynman、Pulay 与非自洽修正](#4-力的计算hellmannfeynmanpulay-与非自洽修正)
5. [电子结构层级：DFT、HF 与 post-HF](#5-电子结构层级dfthf-与-post-hf)
6. [基组选择：局域基、平面波与赝势](#6-基组选择局域基平面波与赝势)
7. [方法选择与实践判断](#7-方法选择与实践判断)
8. [本篇核心公式速查](#8-本篇核心公式速查)
9. [参考文献与延伸阅读](#9-参考文献与延伸阅读)

---

## 1. 为什么需要第一性原理分子动力学

### 1.1 分子动力学的核心问题：如何得到原子核所受的力？

分子动力学（Molecular Dynamics, MD）的基本任务是给出原子核坐标随时间的演化。若将第 \(I\) 个原子核的位置记为 \(\mathbf R_I\)，质量记为 \(M_I\)，则经典核运动满足

$$
M_I \ddot{\mathbf R}_I(t)=\mathbf F_I(t).
$$

若体系存在一个势能函数 \(V(\{\mathbf R_I\})\)，则力由势能梯度给出：

$$
\mathbf F_I(t)=-\nabla_I V(\{\mathbf R_I(t)\}).
$$

因此，MD 的本质问题并不是“牛顿方程怎么写”，而是：

$$
\boxed{\text{如何在每一个构型 }\{\mathbf R_I\}\text{ 上准确、稳定且高效地得到 }V\text{ 和 }\mathbf F_I?}
$$

经典 MD 通常把电子自由度“预先积分掉”，用一个经验或半经验的势函数表示原子间相互作用。例如可写成多体展开：

$$
V_e^{\mathrm{approx}}(\{\mathbf R_I\})
=
\sum_I v_1(\mathbf R_I)
+
\sum_{I<J} v_2(\mathbf R_I,\mathbf R_J)
+
\sum_{I<J<K}v_3(\mathbf R_I,\mathbf R_J,\mathbf R_K)
+\cdots .
$$

于是经典 MD 的运动方程为

$$
M_I\ddot{\mathbf R}_I(t)
=
-
\nabla_I V_e^{\mathrm{approx}}(\{\mathbf R_I(t)\}).
$$

在很多问题中，\(V_e^{\mathrm{approx}}\) 可以非常成功：液体结构、扩散、聚合物构象、大生物分子采样等问题都高度依赖高质量力场的发展。但是固定势函数也有天然边界。

---

### 1.2 固定势函数的根本限制

传统势函数的主要困难通常出现在所谓“化学复杂”体系中：

1. 体系包含多种元素、价态、配位环境，导致需要参数化大量不同类型的相互作用；
2. 模拟过程中电子结构和成键模式会发生定性改变，例如断键、成键、电荷转移、质子转移、表面反应、催化中间体形成等。

对这类问题，用一个预先固定的势函数描述所有可能路径往往很困难。第一性原理分子动力学（ab initio molecular dynamics, AIMD；也常称 first-principles MD、on-the-fly MD、direct MD）采用另一条路线：

$$
\boxed{\text{不预先构造全局势能面，而是在轨迹推进过程中现场求解电子结构，并由电子结构给出力。}}
$$

即在每个时间步，对当前核构型 \(\{\mathbf R_I(t)\}\) 求解一个近似电子结构问题，然后计算

$$
\mathbf F_I(t)
=
-
\nabla_I E_{\mathrm{el}}(\{\mathbf R_I(t)\}).
$$

这里的 \(E_{\mathrm{el}}\) 不是经验势能，而是由量子化学或密度泛函理论等电子结构方法得到的能量。AIMD 的“第一性”不意味着没有近似，而意味着近似从“选择模型势函数”转移到了“选择电子结构理论、基组、赝势、泛函和数值收敛标准”。

---

### 1.3 势能面的维数瓶颈

如果试图预先构造一个全局势能面，对于一个无约束的非线性 \(N\) 原子体系，去掉整体平动与转动后，内部自由度数为

$$
3N-6.
$$

如果每个自由度仅取 10 个离散点，那么为了粗略覆盖势能面，需要的电子结构单点计算数目约为

$$
10^{3N-6}.
$$

这个数量随 \(N\) 指数增长。假设一条 AIMD 轨迹需要约 \(10^M\) 个时间步，为了统计平均需要 \(10^n\) 条独立轨迹，则总电子结构计算量约为

$$
10^{M+n}.
$$

于是，在这个非常粗略的数量级估计下，相对于预先构造全局势能面，on-the-fly 方法的计算优势约为

$$
10^{3N-6-M-n}.
$$

这说明 AIMD 的优势并非“每一步很便宜”，恰恰相反，AIMD 的每一步通常很贵；其优势在于避免了高维全局势能面的显式构造。

更准确地说：AIMD 并不是取消势能面，而是只在动力学轨迹实际访问到的构型附近计算局部能量和梯度。

---

## 2. 从完整电子—核运动方程出发

### 2.1 完整非相对论哈密顿量

考虑电子坐标 \(\{\mathbf r_i\}\) 与原子核坐标 \(\{\mathbf R_I\}\)。非相对论量子力学的出发点是含时薛定谔方程：

$$
i\hbar\frac{\partial}{\partial t}
\Phi(\{\mathbf r_i\},\{\mathbf R_I\};t)
=
\hat H
\Phi(\{\mathbf r_i\},\{\mathbf R_I\};t).
$$

完整哈密顿量可写为

$$
\hat H
=
-
\sum_I\frac{\hbar^2}{2M_I}\nabla_I^2
-
\sum_i\frac{\hbar^2}{2m_e}\nabla_i^2
+
\sum_{i<j}\frac{e^2}{|\mathbf r_i-\mathbf r_j|}
-
\sum_{I,i}\frac{Z_Ie^2}{|\mathbf R_I-\mathbf r_i|}
+
\sum_{I<J}\frac{Z_IZ_Je^2}{|\mathbf R_I-\mathbf R_J|}.
$$

在原子单位制下，\(\hbar=m_e=e=1\)，可写为

$$
\hat H
=
-
\sum_I\frac{1}{2M_I}\nabla_I^2
+
\hat H_e(\{\mathbf r_i\};\{\mathbf R_I\}),
$$

其中电子哈密顿量定义为

$$
\hat H_e
=
-
\sum_i\frac{1}{2}\nabla_i^2
+
\sum_{i<j}\frac{1}{|\mathbf r_i-\mathbf r_j|}
-
\sum_{I,i}\frac{Z_I}{|\mathbf R_I-\mathbf r_i|}
+
\sum_{I<J}\frac{Z_IZ_J}{|\mathbf R_I-\mathbf R_J|}.
$$

最后一项 \(E_{nn}=\sum_{I<J}Z_IZ_J/|\mathbf R_I-\mathbf R_J|\) 对电子坐标而言是常数，但对核坐标求梯度时会贡献核—核排斥力。

---

### 2.2 电子与核运动的分离：TDSCF 近似

严格求解 \(\Phi(\{\mathbf r_i\},\{\mathbf R_I\};t)\) 几乎不可能。一个最简单的分离思路是令总波函数近似为电子波函数与核波函数的乘积：

$$
\Phi(\{\mathbf r_i\},\{\mathbf R_I\};t)
\approx
\Psi(\{\mathbf r_i\};t)\,
\chi(\{\mathbf R_I\};t)\,
\exp\left[\frac{i}{\hbar}\int_{t_0}^{t}\widetilde E_e(t')\,dt'\right].
$$

该近似会导出时间依赖自洽场（time-dependent self-consistent field, TDSCF）图像：电子在由核波函数平均出来的势场中运动，原子核在由电子波函数平均出来的势场中运动。形式上可写为

$$
i\hbar\frac{\partial \Psi}{\partial t}
=
\left[
\hat T_e+
\int d\mathbf R\,|\chi(\{\mathbf R_I\};t)|^2
\hat V_{n-e}(\{\mathbf r_i\},\{\mathbf R_I\})
\right]\Psi,
$$

$$
i\hbar\frac{\partial \chi}{\partial t}
=
\left[
\hat T_n+
\int d\mathbf r\,\Psi^*(\{\mathbf r_i\};t)\hat H_e\Psi(\{\mathbf r_i\};t)
\right]\chi.
$$

这个近似的重要后果是：电子与核之间的纠缠被平均场化处理。它为后续的 Ehrenfest、Born–Oppenheimer 和 Car–Parrinello 分子动力学提供统一出发点。

---

### 2.3 核运动的经典极限

为了得到经典核运动，可以将核波函数写成极形式：

$$
\chi(\{\mathbf R_I\};t)
=
A(\{\mathbf R_I\};t)
\exp\left[\frac{i}{\hbar}S(\{\mathbf R_I\};t)\right],
$$

其中 \(A\) 与 \(S\) 为实函数。将其代入核的 TDSCF 方程，并取 \(\hbar\to 0\) 的经典极限，可得 Hamilton–Jacobi 方程：

$$
\frac{\partial S}{\partial t}
+
\sum_I\frac{1}{2M_I}(\nabla_I S)^2
+
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle
=0.
$$

利用正则动量定义

$$
\mathbf P_I=\nabla_I S,
$$

即可得到核的牛顿方程：

$$
M_I\ddot{\mathbf R}_I(t)
=
-
\nabla_I
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle.
$$

同时，在经典极限下，核密度可由集中在经典轨迹上的 delta 函数表示：

$$
|\chi(\{\mathbf R_I\};t)|^2
\longrightarrow
\prod_I\delta(\mathbf R_I-\mathbf R_I(t)).
$$

于是电子波函数满足

$$
i\hbar\frac{\partial \Psi}{\partial t}
=
\hat H_e(\{\mathbf r_i\};\{\mathbf R_I(t)\})\Psi.
$$

这组方程就是 Ehrenfest 分子动力学的基本形式。

---

## 3. 几类核心分子动力学方案

### 3.1 经典分子动力学：电子自由度被预先积分掉

经典 MD 假设电子自由度已经体现在一个固定势函数 \(V_e^{\mathrm{approx}}\) 中：

$$
M_I\ddot{\mathbf R}_I(t)
=
-
\nabla_I V_e^{\mathrm{approx}}(\{\mathbf R_I(t)\}).
$$

其理论假设可以概括为：

$$
\text{电子绝热跟随核构型}
\quad + \quad
\text{电子自由度可被积分掉}
\quad + \quad
\text{势能面可由可管理的函数形式近似。}
$$

经典 MD 的准确性主要受势函数质量限制。对非反应性采样，它可极其高效；对成键模式变化问题，它需要反应力场、机器学习势或直接使用第一性原理方法。

---

### 3.2 Ehrenfest 分子动力学：电子真实含时传播，原子核感受平均力

Ehrenfest MD 的基本方程为

$$
M_I\ddot{\mathbf R}_I(t)
=
-
\nabla_I
\left\langle \Psi(t)\middle|\hat H_e(\{\mathbf R(t)\})\middle|\Psi(t)\right\rangle,
$$

$$
i\hbar\frac{\partial \Psi(t)}{\partial t}
=
\hat H_e(\{\mathbf R(t)\})\Psi(t).
$$

若在瞬时绝热电子态 \(\{\Psi_k\}\) 上展开电子波函数：

$$
\Psi(\{\mathbf r_i\},\{\mathbf R_I\};t)
=
\sum_k c_k(t)\Psi_k(\{\mathbf r_i\};\{\mathbf R_I\}),
$$

其中

$$
\hat H_e(\{\mathbf R_I\})\Psi_k
=
E_k(\{\mathbf R_I\})\Psi_k,
$$

则可得到包含非绝热耦合的运动方程：

$$
M_I\ddot{\mathbf R}_I
=
-
\sum_k |c_k|^2\nabla_I E_k
-
\sum_{k,l}c_k^*c_l(E_k-E_l)\mathbf d_I^{kl},
$$

$$
i\hbar \dot c_k
=
c_kE_k
-i\hbar\sum_{I,l}c_l\dot{\mathbf R}_I\cdot \mathbf d_I^{kl},
$$

非绝热耦合向量定义为

$$
\mathbf d_I^{kl}
=
\left\langle \Psi_k\middle|\nabla_I\Psi_l\right\rangle.
$$

Ehrenfest MD 的优点是电子态可显式混合，天然包含平均场意义下的非绝热效应。其问题也很明确：电子运动时间尺度远快于核运动，数值传播通常需要非常小的时间步；此外，核只感受到电子态加权平均力，因此在多态动力学中可能出现平均场图像的局限。

---

### 3.3 Born–Oppenheimer 分子动力学：每一步求电子基态

Born–Oppenheimer 分子动力学（BOMD）采用另一种路线：在每个核构型下，先求解定态电子结构问题：

$$
\hat H_e(\{\mathbf R_I\})\Psi_0
=
E_0(\{\mathbf R_I\})\Psi_0,
$$

或等价地写成变分问题：

$$
E_0(\{\mathbf R_I\})
=
\min_{\Psi}
\left\{
\left\langle \Psi\middle|\hat H_e(\{\mathbf R_I\})\middle|\Psi\right\rangle
\right\}.
$$

然后核在该 Born–Oppenheimer 势能面上运动：

$$
M_I\ddot{\mathbf R}_I(t)
=
-
\nabla_I E_0(\{\mathbf R_I(t)\}).
$$

BOMD 的典型算法为：

```text
给定 R(t), V(t)
    1. 固定核坐标 R(t)
    2. 通过 SCF 或直接最小化求电子基态 Ψ0(t)
    3. 计算力 F_I(t) = -∇_I E0(R(t))
    4. 用数值积分器更新 R(t+Δt), V(t+Δt)
    5. 重复
```

需要注意的是，BOMD 通常使用 clamped-nuclei Born–Oppenheimer 势能面。若考虑对角 Born–Oppenheimer 修正（diagonal Born–Oppenheimer correction），则势能面会进一步修正；常规 BOMD 中这类项通常忽略。因此“Born–Oppenheimer MD”和“绝热 MD”不应在所有语境下简单等同。

BOMD 的优点是物理图像清晰、电子问题每步处于定义明确的定态极小点；缺点是每个时间步都需要足够收敛的电子结构计算，计算成本高，且能量守恒对 SCF 收敛阈值非常敏感。

---

### 3.4 Car–Parrinello 分子动力学：扩展拉格朗日量与虚构电子质量

Car–Parrinello 分子动力学（CPMD）的关键思想是：不在每个时间步完全重新最小化电子能量，而是将电子轨道也作为经典动力学变量传播。为此给轨道引入虚构质量 \(\mu_i\)，构造扩展拉格朗日量：

$$
L_{\mathrm{CP}}
=
\sum_I\frac{1}{2}M_I\dot{\mathbf R}_I^2
+
\sum_i\frac{1}{2}\mu_i
\left\langle \dot\psi_i\middle|\dot\psi_i\right\rangle
-
E[\{\psi_i\};\{\mathbf R_I\}]
+
\sum_{ij}\Lambda_{ij}
\left(\left\langle \psi_i\middle|\psi_j\right\rangle-\delta_{ij}\right).
$$

其中 \(\Lambda_{ij}\) 是维持轨道正交归一性的拉格朗日乘子。

由 Euler–Lagrange 方程可得

$$
M_I\ddot{\mathbf R}_I
=
-
\frac{\partial E}{\partial \mathbf R_I}
+
\frac{\partial}{\partial \mathbf R_I}\{\text{constraints}\},
$$

$$
\mu_i\ddot\psi_i
=
-
\frac{\delta E}{\delta \psi_i^*}
+
\sum_j\Lambda_{ij}\psi_j.
$$

CPMD 中电子轨道的“动能”为

$$
T_e
=
\sum_i\frac{1}{2}\mu_i
\left\langle \dot\psi_i\middle|\dot\psi_i\right\rangle.
$$

扩展体系的守恒量为

$$
E_{\mathrm{cons}}
=
\sum_I\frac{1}{2}M_I\dot{\mathbf R}_I^2
+
E[\{\psi_i\};\{\mathbf R_I\}]
+
\sum_i\frac{1}{2}\mu_i
\left\langle \dot\psi_i\middle|\dot\psi_i\right\rangle.
$$

常定义“物理能量”为

$$
E_{\mathrm{phys}}
=
E_{\mathrm{cons}}-T_e
=
\sum_I\frac{1}{2}M_I\dot{\mathbf R}_I^2
+
E[\{\psi_i\};\{\mathbf R_I\}].
$$

CPMD 的核心要求是“热的原子核”和“冷的电子”之间保持绝热分离。所谓“冷电子”不是指真实电子温度，而是指 \(T_e\) 足够小、电子轨道始终贴近瞬时 Born–Oppenheimer 极小点。

---

### 3.5 Car–Parrinello 方法为什么能近似 Born–Oppenheimer 动力学？

对轨道自由度在电子能量极小点附近作谐近似，可得到电子虚构动力学频率大致满足

$$
\omega_{ij}
\approx
\left[\frac{2(\varepsilon_i-\varepsilon_j)}{\mu}\right]^{1/2},
$$

其中 \(\varepsilon_j\) 与 \(\varepsilon_i\) 分别可理解为占据态与非占据态的单粒子本征值。于是最低电子虚构频率可估为

$$
\omega_e^{\min}
\propto
\left(\frac{E_{\mathrm{gap}}}{\mu}\right)^{1/2}.
$$

若最高核运动频率为 \(\omega_n^{\max}\)，为了保持绝热分离，需要

$$
\omega_e^{\min} \gg \omega_n^{\max}.
$$

但电子虚构频谱的最高频率还与平面波截断能 \(E_{\mathrm{cut}}\) 有关：

$$
\omega_e^{\max}
\propto
\left(\frac{E_{\mathrm{cut}}}{\mu}\right)^{1/2}.
$$

数值积分的最大时间步由体系最高频率控制，因此

$$
\Delta t_{\max}
\propto
\left(\frac{\mu}{E_{\mathrm{cut}}}\right)^{1/2}.
$$

这给出 CPMD 参数选择中的基本矛盾：

$$
\mu \downarrow
\Rightarrow
\omega_e^{\min}\uparrow
\Rightarrow
\text{绝热性更好，电子更贴近 BO 面；}
$$

但同时

$$
\mu \downarrow
\Rightarrow
\Delta t_{\max}\downarrow
\Rightarrow
\text{可用时间步更小，计算更贵。}
$$

因此，CPMD 并不是“免费避免 SCF”的方法，而是在电子虚构动力学稳定性、绝热分离和时间步之间做折中。

对于有限能隙体系，CPMD 可以很好地接近 BO 动力学。在存在有限电子能隙且 \(\mu\) 足够小时，CP 轨迹相对于 BO 轨迹的偏离可在一定时间区间内由 \(\mu\) 控制，常见形式为

$$
\Delta_\mu
=
|\mathbf R^\mu(t)-\mathbf R^0(t)|
+
\left\|\psi^\mu(t)-\psi^0(t)\right\|
\le C\mu^{1/2},
$$

并且

$$
T_e\le C\mu.
$$

这说明虚构质量越小，CPMD 越接近 BOMD；但实践中不能无限减小 \(\mu\)，因为时间步会随之降低。

对金属或小带隙体系，\(E_{\mathrm{gap}}\to 0\)，则

$$
\omega_e^{\min}\to 0,
$$

电子虚构频谱可能与核运动频谱重叠，绝热分离失效。因此强金属性体系通常更适合使用 BOMD 或带有电子温度、分数占据和稳健 SCF 的方案。

---

## 4. 力的计算：Hellmann–Feynman、Pulay 与非自洽修正

### 4.1 力的形式导数

AIMD 中最关键的量是核力：

$$
\mathbf F_I
=
-
\nabla_I
\left\langle \Psi_0\middle|\hat H_e\middle|\Psi_0\right\rangle.
$$

对能量期望值求导有

$$
\nabla_I
\left\langle \Psi_0\middle|\hat H_e\middle|\Psi_0\right\rangle
=
\left\langle \Psi_0\middle|\nabla_I\hat H_e\middle|\Psi_0\right\rangle
+
\left\langle \nabla_I\Psi_0\middle|\hat H_e\middle|\Psi_0\right\rangle
+
\left\langle \Psi_0\middle|\hat H_e\middle|\nabla_I\Psi_0\right\rangle.
$$

如果 \(\Psi_0\) 是当前哈密顿量的精确本征态，并且使用完备基组，则后两项可抵消，得到 Hellmann–Feynman 力：

$$
\mathbf F_I^{\mathrm{HFT}}
=
-
\left\langle \Psi_0\middle|\nabla_I\hat H_e\middle|\Psi_0\right\rangle.
$$

但实际数值计算中，波函数通常由有限基组展开，且 SCF 不可能达到数学意义上的完全收敛。因此不能简单说“第一性原理力就是 Hellmann–Feynman 力”。

---

### 4.2 有限基组中的 Pulay 力

设单粒子轨道由基函数展开：

$$
\psi_i(\mathbf r)
=
\sum_\nu c_{i\nu} f_\nu(\mathbf r;\{\mathbf R_I\}).
$$

对核坐标求导：

$$
\nabla_I\psi_i
=
\sum_\nu(\nabla_I c_{i\nu})f_\nu
+
\sum_\nu c_{i\nu}(\nabla_I f_\nu).
$$

第二项来自基函数本身对核坐标的显式依赖。对于原子中心高斯基、Slater 基或其他随原子移动的局域基，这一项一般不为零，会产生 Pulay 力或 incomplete-basis-set correction。

总力通常可分解为

$$
\mathbf F_I
=
\mathbf F_I^{\mathrm{HFT}}
+
\mathbf F_I^{\mathrm{IBS}}
+
\mathbf F_I^{\mathrm{NSC}}.
$$

其中：

- \(\mathbf F_I^{\mathrm{HFT}}\)：Hellmann–Feynman 项；
- \(\mathbf F_I^{\mathrm{IBS}}\)：有限基组修正，也即通常所说的 Pulay 力；
- \(\mathbf F_I^{\mathrm{NSC}}\)：非自洽修正，来自当前电子结构未完全达到自洽极小点。

对于原子中心基组，还要注意正交归一约束本身可能依赖核坐标：

$$
\left\langle \psi_i\middle|\psi_j\right\rangle
=
\sum_{\mu\nu}c_{i\mu}^*c_{j\nu}S_{\mu\nu}(\{\mathbf R_I\})
=
\delta_{ij},
$$

其中

$$
S_{\mu\nu}(\{\mathbf R_I\})
=
\left\langle f_\mu\middle|f_\nu\right\rangle.
$$

如果约束依赖核坐标，则 CP 方程中的核力还可能含有约束力项：

$$
\sum_{ij}\Lambda_{ij}
\sum_{\mu\nu}c_{i\mu}^*c_{j\nu}
\frac{\partial S_{\mu\nu}(\{\mathbf R_I\})}{\partial \mathbf R_I}.
$$

这类项若被忽略，扩展体系的严格能量守恒会受到影响。

---

### 4.3 平面波基组中的简化

平面波基函数不随原子核移动。若平面波数目固定，则

$$
\nabla_I f_\nu(\mathbf r)=0,
$$

因而 Pulay 力消失。这也是平面波—赝势 DFT 在 AIMD 中极为流行的重要原因之一。

但需要区分 Pulay force 与 Pulay stress：在变胞或恒压模拟中，如果固定的是截断能而不是固定平面波集合，随晶胞变化可用平面波数可能改变，此时应考虑 Pulay stress 对应的影响。

---

### 4.4 BOMD 与 CPMD 对“非自洽”的不同要求

在 BOMD 中，核力定义为

$$
\mathbf F_I^{\mathrm{BO}}
=
-
\nabla_I
\min_{\Psi}
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle.
$$

因此每一步必须尽可能达到电子能量极小点。若 SCF 收敛不足，\(\mathbf F_I^{\mathrm{NSC}}\) 会表现为系统误差，并可能导致总能量漂移。

而在 CPMD 中，力来自扩展拉格朗日量在当前轨道 \(\{\psi_i(t)\}\) 上的变分导数。当前轨道不必是严格 BO 极小点，但必须通过小的 \(T_e\)、稳定的 \(E_{\mathrm{cons}}\) 和电子—核频谱分离保证其始终在 BO 面附近。换言之，CPMD 的数值质量不由单步 SCF 收敛阈值衡量，而由绝热性和扩展能量守恒共同衡量。

---

## 5. 电子结构层级：DFT、HF 与 post-HF

AIMD 本身不是某一种电子结构方法。理论上，只要能给出能量和力，就可以与 MD 结合。实际中，计算成本决定了常用方法以 Kohn–Sham DFT 为主。

---

### 5.1 Kohn–Sham 密度泛函理论

在固定核坐标 \(\{\mathbf R_I\}\) 下，Kohn–Sham DFT 将相互作用电子体系的基态问题转化为一组辅助单粒子轨道 \(\{\phi_i\}\) 的变分问题：

$$
E_0(\{\mathbf R_I\})
=
\min_{\Psi}
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle
=
\min_{\{\phi_i\}}E^{\mathrm{KS}}[\{\phi_i\}].
$$

Kohn–Sham 能量泛函可写为

$$
E^{\mathrm{KS}}[\{\phi_i\}]
=
T_s[\{\phi_i\}]
+
\int d\mathbf r\,V_{\mathrm{ext}}(\mathbf r)n(\mathbf r)
+
\frac{1}{2}\int d\mathbf r\,V_H(\mathbf r)n(\mathbf r)
+
E_{xc}[n]
+
E_{nn}.
$$

电子密度为

$$
n(\mathbf r)
=
\sum_i^{\mathrm{occ}} f_i|\phi_i(\mathbf r)|^2.
$$

非相互作用参考体系动能为

$$
T_s[\{\phi_i\}]
=
\sum_i^{\mathrm{occ}}f_i
\left\langle \phi_i\middle|-
\frac{1}{2}\nabla^2\middle|\phi_i\right\rangle.
$$

Hartree 势为

$$
V_H(\mathbf r)
=
\int d\mathbf r'\frac{n(\mathbf r')}{|\mathbf r-\mathbf r'|},
$$

并满足 Poisson 方程：

$$
\nabla^2 V_H(\mathbf r)=-4\pi n(\mathbf r).
$$

交换—相关势定义为

$$
V_{xc}(\mathbf r)
=
\frac{\delta E_{xc}[n]}{\delta n(\mathbf r)}.
$$

对轨道在正交归一约束下变分，可得 Kohn–Sham 方程：

$$
\left[
-
\frac{1}{2}\nabla^2
+
V_{\mathrm{ext}}(\mathbf r)
+
V_H(\mathbf r)
+
V_{xc}(\mathbf r)
\right]\phi_i(\mathbf r)
=
\sum_j\Lambda_{ij}\phi_j(\mathbf r).
$$

通过占据子空间内的酉变换，可写成正则形式：

$$
\hat H_e^{\mathrm{KS}}\phi_i
=
\varepsilon_i\phi_i.
$$

常见的 GGA 泛函形式为

$$
E_{xc}^{\mathrm{GGA}}[n]
=
\int d\mathbf r\, n(\mathbf r)
\varepsilon_{xc}^{\mathrm{GGA}}(n(\mathbf r),\nabla n(\mathbf r)).
$$

DFT-AIMD 的误差来源至少包括：交换—相关泛函误差、赝势误差、基组截断误差、SCF 收敛误差、有限尺寸效应和采样不足。

---

### 5.2 Hartree–Fock 理论

Hartree–Fock 理论以单个 Slater 行列式近似电子波函数：

$$
\Psi_0=\det\{\psi_i\}.
$$

在轨道正交归一约束

$$
\left\langle \psi_i\middle|\psi_j\right\rangle=\delta_{ij}
$$

下，HF 能量可写为

$$
E^{\mathrm{HF}}
=
\sum_i\left\langle \psi_i\middle|\hat h\middle|\psi_i\right\rangle
+
\frac{1}{2}\sum_{ij}(J_{ij}-K_{ij}),
$$

其中 \(\hat h=-\frac12\nabla^2+V_{\mathrm{ext}}\)。Coulomb 与 exchange 算符对轨道的作用分别为

$$
\hat J_j\psi_i(\mathbf r)
=
\left[
\int d\mathbf r'\,
\frac{|\psi_j(\mathbf r')|^2}{|\mathbf r-\mathbf r'|}
\right]
\psi_i(\mathbf r),
$$

$$
\hat K_j\psi_i(\mathbf r)
=
\left[
\int d\mathbf r'\,
\frac{\psi_j^*(\mathbf r')\psi_i(\mathbf r')}{|\mathbf r-\mathbf r'|}
\right]
\psi_j(\mathbf r).
$$

HF 方程为

$$
\left[
-
\frac{1}{2}\nabla^2
+V_{\mathrm{ext}}(\mathbf r)
+
\sum_j\hat J_j
-
\sum_j\hat K_j
\right]
\psi_i
=
\sum_j\Lambda_{ij}\psi_j.
$$

其中 exchange 算符 \(\hat K_j\) 是非局域算符。HF 可用于 AIMD，但对凝聚相和大体系通常比半局域 DFT 更昂贵；同时 HF 缺失动态相关，单独使用时对许多化学问题并不充分。

---

### 5.3 post-HF 方法与 AIMD

post-HF 方法如 MP2、CI、CASSCF、CC、FCI 等能够更系统地处理电子相关，但计算成本随电子数增长很快。因此它们在 AIMD 中通常用于小体系、短轨迹或高精度基准。

需要特别注意：CPMD 要求能量表达式与被传播的波函数变量之间具有一致的变分关系，即

$$
\frac{\delta E}{\delta \psi_i^*}
$$

必须能作为轨道虚构动力学中的“力”。标准 MP2 中能量是二阶校正，但波函数仍以 HF 参考为基础，并不直接满足这种简单的一致性。因此，post-HF 与 CPMD 的结合并不总是直接；而 BOMD 只要能给出足够准确的能量梯度，原则上更容易与多种电子结构方法结合。

---

## 6. 基组选择：局域基、平面波与赝势

### 6.1 轨道展开的一般形式

无论采用 DFT 还是 HF，单粒子轨道通常都要在一组基函数上展开：

$$
\psi_i(\mathbf r)
=
\sum_\nu c_{i\nu}f_\nu(\mathbf r;\{\mathbf R_I\}).
$$

基组选择影响计算成本、收敛行为、力的表达式、周期边界处理以及是否存在 Pulay 力。

---

### 6.2 Slater 型轨道与 Gaussian 型轨道

量子化学中常见的 Slater 型轨道（STO）可写为

$$
f_m^{\mathrm S}(\mathbf r)
=
N_m^{\mathrm S}
 x^{m_x}y^{m_y}z^{m_z}
\exp(-\zeta_m|\mathbf r|),
$$

Gaussian 型轨道（GTO）可写为

$$
f_m^{\mathrm G}(\mathbf r)
=
N_m^{\mathrm G}
 x^{m_x}y^{m_y}z^{m_z}
\exp(-\alpha_m r^2).
$$

实际使用时，这些函数通常中心在原子核上，即 \(\mathbf r\to \mathbf r-\mathbf R_I\)。局域基的优点是对分子体系自然、紧凑，缺点是：

1. 基函数依赖核坐标，力中需要 Pulay 项；
2. 基组平衡性和 BSSE 需要仔细控制；
3. 周期体系、金属体系、均匀电子气风格问题未必最自然。

---

### 6.3 平面波基组

周期体系中常用平面波展开。平面波基函数为

$$
f_{\mathbf G}^{\mathrm{PW}}(\mathbf r)
=
\frac{1}{\sqrt{\Omega}}
\exp(i\mathbf G\cdot\mathbf r),
$$

其中 \(\Omega\) 是晶胞体积，\(\mathbf G\) 为倒易格矢。实际计算中只保留满足

$$
\frac{1}{2}|\mathbf G|^2\le E_{\mathrm{cut}}
$$

的平面波。

平面波基组的优点包括：

- 系统性可收敛：增加 \(E_{\mathrm{cut}}\) 即可提高基组质量；
- 不依赖核坐标，固定平面波集合时 Pulay 力为零；
- 对周期体系自然；
- 动能算符在倒空间对角，局域势在实空间方便处理，二者可通过 FFT 高效切换；
- 基组不偏向某个原子或区域，常被视作较为平衡的基组。

缺点也很明确：

- 描述核附近快速振荡的全电子波函数需要极高截断能；
- 对真空区域很大的孤立分子、表面或低维体系会浪费大量基函数；
- 多尺度局域特征不容易自适应处理；
- 通常需要赝势或 PAW 思想配合。

---

### 6.4 赝势的作用

全电子波函数在核附近通常具有节点和快速振荡，平面波展开这类结构非常昂贵。许多化学性质主要由价电子决定，核心电子常可视为相对惰性。因此可用赝势将核心电子与原子核对价电子的作用合并为有效势：

$$
\hat V_{\mathrm{ion}}
\approx
\hat V_{\mathrm{pseudo}}.
$$

赝势思想的目标是：

1. 移除核心电子自由度，降低显式电子数；
2. 使价电子赝波函数在核心区更平滑；
3. 在核心区外尽可能再现真实价电子散射性质与能量性质。

平面波—赝势—DFT 的组合是许多 AIMD 程序的标准工作框架之一。

---

## 7. 方法选择与实践判断

| 方法 | 电子处理 | 核运动 | 主要优点 | 主要限制 | 典型适用场景 |
|---|---|---|---|---|---|
| 经典 MD | 电子自由度被固定势函数代替 | 牛顿方程 | 便宜、长时间、大体系 | 力场限制，反应与电子重排困难 | 非反应性大体系、长时间采样 |
| Ehrenfest MD | 电子波函数真实含时传播 | 感受电子平均力 | 可包含平均场非绝热效应 | 电子时间尺度限制步长，平均场局限 | 碰撞、激发态、非绝热过程的特定问题 |
| BOMD | 每步求电子定态极小点 | 在 BO 面上运动 | 概念清晰、适合小带隙/金属、易与多种电子结构方法结合 | 每步 SCF/优化昂贵，能量守恒依赖收敛 | 反应、液体、材料、金属/小带隙体系 |
| CPMD | 轨道作为带虚构质量的动力学变量传播 | 与轨道共同传播 | 避免每步完全 SCF，轨迹平滑，能量守恒可严格监控 | 需要绝热分离；小带隙/金属困难；参数依赖 \(\mu\) | 大带隙体系、平面波 DFT、经典 AIMD 场景 |

实际选择建议：

- 若体系为强金属性或小带隙体系，优先考虑 BOMD；
- 若体系为大带隙绝缘体或分子体系，CPMD 可能非常高效，但必须检查 \(T_e\)、\(E_{\mathrm{cons}}\) 与能量漂移；
- 若关心真实非绝热动力学，Ehrenfest 只是一个平均场方案，常需与 surface hopping、多态量子动力学或 TDDFT 等方法比较；
- 若目标是长时间构象采样，AIMD 往往时间尺度不足，机器学习势、QM/MM 或增强采样可能更合适。

---

## 8. 本篇核心公式速查

### 8.1 核的经典运动方程

$$
M_I\ddot{\mathbf R}_I=-\nabla_I V(\{\mathbf R_I\}).
$$

### 8.2 全电子—核哈密顿量

$$
\hat H
=
-
\sum_I\frac{1}{2M_I}\nabla_I^2
+
\hat H_e(\{\mathbf r_i\};\{\mathbf R_I\}).
$$

### 8.3 Ehrenfest MD

$$
M_I\ddot{\mathbf R}_I
=
-
\nabla_I
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle,
$$

$$
i\hbar\frac{\partial\Psi}{\partial t}
=
\hat H_e(\{\mathbf R(t)\})\Psi.
$$

### 8.4 Born–Oppenheimer MD

$$
E_0(\{\mathbf R_I\})
=
\min_\Psi
\left\langle \Psi\middle|\hat H_e\middle|\Psi\right\rangle,
$$

$$
M_I\ddot{\mathbf R}_I
=
-
\nabla_I E_0(\{\mathbf R_I\}).
$$

### 8.5 Car–Parrinello 拉格朗日量

$$
L_{\mathrm{CP}}
=
\sum_I\frac{1}{2}M_I\dot{\mathbf R}_I^2
+
\sum_i\frac{1}{2}\mu_i
\left\langle \dot\psi_i\middle|\dot\psi_i\right\rangle
-
E[\{\psi_i\};\{\mathbf R_I\}]
+
\sum_{ij}\Lambda_{ij}
(\langle\psi_i|\psi_j\rangle-\delta_{ij}).
$$

### 8.6 CP 绝热性估计

$$
\omega_e^{\min}
\propto
\left(\frac{E_{\mathrm{gap}}}{\mu}\right)^{1/2},
$$

$$
\omega_e^{\max}
\propto
\left(\frac{E_{\mathrm{cut}}}{\mu}\right)^{1/2},
$$

$$
\Delta t_{\max}
\propto
\left(\frac{\mu}{E_{\mathrm{cut}}}\right)^{1/2}.
$$

### 8.7 总力分解

$$
\mathbf F_I
=
\mathbf F_I^{\mathrm{HFT}}
+
\mathbf F_I^{\mathrm{IBS}}
+
\mathbf F_I^{\mathrm{NSC}}.
$$

### 8.8 Kohn–Sham DFT 能量泛函

$$
E^{\mathrm{KS}}
=
T_s
+
\int V_{\mathrm{ext}}(\mathbf r)n(\mathbf r)d\mathbf r
+
\frac{1}{2}\int V_H(\mathbf r)n(\mathbf r)d\mathbf r
+
E_{xc}[n]
+
E_{nn}.
$$

### 8.9 平面波基组

$$
f_{\mathbf G}^{\mathrm{PW}}(\mathbf r)
=
\frac{1}{\sqrt{\Omega}}e^{i\mathbf G\cdot\mathbf r},
\qquad
\frac{1}{2}|\mathbf G|^2\le E_{\mathrm{cut}}.
$$

---

## 9. 参考文献与延伸阅读

1. Dominik Marx and Jürg Hutter, **Ab initio molecular dynamics: Theory and Implementation**, in *Modern Methods and Algorithms of Quantum Chemistry*, NIC Series, Vol. 1, 2000.
2. R. Car and M. Parrinello, **Unified Approach for Molecular Dynamics and Density-Functional Theory**, *Physical Review Letters* **55**, 2471–2474, 1985.
3. M. Born and R. Oppenheimer, **Zur Quantentheorie der Molekeln**, *Annalen der Physik* **84**, 457–484, 1927.
4. P. Hohenberg and W. Kohn, **Inhomogeneous Electron Gas**, *Physical Review* **136**, B864–B871, 1964.
5. W. Kohn and L. J. Sham, **Self-Consistent Equations Including Exchange and Correlation Effects**, *Physical Review* **140**, A1133–A1138, 1965.

---

## 结语

第一性原理分子动力学的核心不是“让原子动起来”这么简单，而是把电子结构理论、经典核运动、数值积分和统计采样放入同一个闭环中：

$$
\{\mathbf R_I(t)\}
\longrightarrow
\text{电子结构}
\longrightarrow
E,\mathbf F_I
\longrightarrow
\{\mathbf R_I(t+\Delta t)\}.
$$

这也是 AIMD 与普通动画式分子可视化的根本区别：轨迹不是预设的，而是由势能面局部梯度、电子结构近似和动力学积分共同决定的。

下一篇可以继续展开：平面波—赝势 DFT 的实现、周期边界条件、FFT、Ewald 求和、应力张量、恒温恒压 AIMD，以及如何判断一条 AIMD 轨迹是否“可信”。
