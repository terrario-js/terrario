import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Minimal yet powerful APIs',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Terrarioはできる限り動作を予測しやすく、かつ動作が重複しているAPIが少なくなるように設計されています。
        目的の処理を行うために必要なAPIは1つしか無いため、実装方法で迷うことがほとんどありません。
        また、APIセットが少ないため学習コストを下げることができます。
      </>
    ),
  },
  {
    title: 'Scannerless parsing',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        パーサーには直接入力文字列を入力します。パーサーの前段にスキャナー(トークナイザー)を作成する必要がないため、
        実装の手間を削減できます。また、トークナイズを行わないことでより柔軟な構文解析が可能になっています。
      </>
    ),
  },
  {
    title: 'Supports conditional control by state',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        state変数の値によってパーサーの処理を分岐させる機能がサポートされています。
        これにより、より複雑な構文の解析が可能になります。
      </>
    ),
  },
  {
    title: 'Zero dependency',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Terrarioには依存するパッケージがありません。プロジェクトの依存関係をクリーンに保つことができます。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
