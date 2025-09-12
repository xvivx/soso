// ----------------------------------------------------------------------

function path(root: string, subLink: string) {
  return `${root}${subLink}`;
}

const RootTradeCenter = '/trade-center';
// ----------------------------------------------------------------------
export const PathTradeCenter = {
  root: RootTradeCenter,
  trade: path(RootTradeCenter, ''),
  futures: path(RootTradeCenter, '/futures'),
  spread: path(RootTradeCenter, '/spread'),
  upDown: path(RootTradeCenter, '/up-down'),
  tapTrading: path(RootTradeCenter, '/tap-trading'),
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PathTradeCenter.futures;
