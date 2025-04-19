import React from 'react';
import PackageListItem from './PackageListItem';

const PackageListSection = ({ title, packages, onRemove, onUpgrade, showRemove, upgrading }) => (
  <>
    <h3>{`${title} (${packages.length})`}</h3>
    <div>
      {packages.map(pkg => (
        <PackageListItem
          key={pkg.id}
          pkg={pkg}
          onRemove={onRemove}
          onUpgrade={onUpgrade}
          showRemove={showRemove}
          upgrading={upgrading}
        />
      ))}
    </div>
  </>
);

export default PackageListSection;
