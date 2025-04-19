import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonButton from '../common/CommonButton';
import CommonIconButton from '../common/CommonIconButton';
import CommonChip from '../common/CommonChip';

const PackageListItem = React.memo(({ pkg, onRemove, onUpgrade, showRemove = true, upgrading }) => {
  const needsUpgrade = pkg.latestVersion && pkg.currentVersion !== pkg.latestVersion;

  return (
    <div>
      <div>
        <div>
          {pkg.name}
          {pkg.metadata && (
            <CommonChip
              label="Followed"
              size="small"
              color="primary"
              variant="outlined"
              title={pkg.metadata}
            />
          )}
        </div>
        <div>{`${pkg.project} - ${pkg.type}`}</div>
      </div>

      <div>
        {needsUpgrade && (
          <>
            <span>{`${pkg.currentVersion} → ${pkg.latestVersion}`}</span>
            <CommonButton
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onUpgrade(pkg)}
              disabled={upgrading[pkg.id]}
              loading={upgrading[pkg.id]}
            >
              Apply Fix
            </CommonButton>
          </>
        )}

        {showRemove && (
          <CommonIconButton
            aria-label="delete"
            icon={<DeleteIcon />}
            onClick={() => onRemove(pkg.id)}
          />
        )}
      </div>
    </div>
  );
});

export default PackageListItem;
