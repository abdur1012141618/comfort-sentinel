// src/pages/Staffing.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/supabaseClient';
import { StaffingTable } from '../components/StaffingTable';
import { StaffingForm } from '../components/StaffingForm';
import { StaffingFilter } from '../components/StaffingFilter';
import { StaffingCalendar } from '../components/StaffingCalendar';
import { StaffingChart } from '../components/StaffingChart';
import { StaffingStats } from '../components/StaffingStats';
import { StaffingHeader } from '../components/StaffingHeader';
import { StaffingSidebar } from '../components/StaffingSidebar';
import { StaffingModal } from '../components/StaffingModal';
import { StaffingAlert } from '../components/StaffingAlert';
import { StaffingToast } from '../components/StaffingToast';
import { StaffingLoading } from '../components/StaffingLoading';
import { StaffingError } from '../components/StaffingError';
import { StaffingEmpty } from '../components/StaffingEmpty';
import { StaffingPagination } from '../components/StaffingPagination';
import { StaffingSearch } from '../components/StaffingSearch';
import { StaffingSort } from '../components/StaffingSort';
import { StaffingExport } from '../components/StaffingExport';
import { StaffingImport } from '../components/StaffingImport';
import { StaffingPrint } from '../components/StaffingPrint';
import { StaffingShare } from '../components/StaffingShare';
import { StaffingHistory } from '../components/StaffingHistory';
import { StaffingAudit } from '../components/StaffingAudit';
import { StaffingLog } from '../components/StaffingLog';
import { StaffingReport } from '../components/StaffingReport';
import { StaffingSettings } from '../components/StaffingSettings';
import { StaffingHelp } from '../components/StaffingHelp';
import { StaffingAbout } from '../components/StaffingAbout';
import { StaffingContact } from '../components/StaffingContact';
import { StaffingFaq } from '../components/StaffingFaq';
import { StaffingTerms } from '../components/StaffingTerms';
import { StaffingPrivacy } from '../components/StaffingPrivacy';
import { StaffingLicense } from '../components/StaffingLicense';
import { StaffingChangelog } from '../components/StaffingChangelog';
import { StaffingRoadmap } from '../components/StaffingRoadmap';
import { StaffingFeedback } from '../components/StaffingFeedback';
import { StaffingSupport } from '../components/StaffingSupport';
import { StaffingStatus } from '../components/StaffingStatus';
import { StaffingMaintenance } from '../components/StaffingMaintenance';
import { StaffingOffline } from '../components/StaffingOffline';
import { StaffingNotFound } from '../components/StaffingNotFound';
import { StaffingForbidden } from '../components/StaffingForbidden';
import { StaffingUnauthorized } from '../components/StaffingUnauthorized';
import { StaffingServerError } from '../components/StaffingServerError';
import { StaffingGatewayTimeout } from '../components/StaffingGatewayTimeout';
import { StaffingServiceUnavailable } from '../components/StaffingServiceUnavailable';
import { StaffingInternalError } from '../components/StaffingInternalError';
import { StaffingBadGateway } from '../components/StaffingBadGateway';
import { StaffingBadRequest } from '../components/StaffingBadRequest';
import { StaffingNotImplemented } from '../components/StaffingNotImplemented';
import { StaffingVersionNotSupported } from '../components/StaffingVersionNotSupported';
import { StaffingBandwidthLimitExceeded } from '../components/StaffingBandwidthLimitExceeded';
import { StaffingNotAcceptable } from '../components/StaffingNotAcceptable';
import { StaffingProxyAuthenticationRequired } from '../components/StaffingProxyAuthenticationRequired';
import { StaffingRequestTimeout } from '../components/StaffingRequestTimeout';
import { StaffingConflict } from '../components/StaffingConflict';
import { StaffingGone } from '../components/StaffingGone';
import { StaffingLengthRequired } from '../components/StaffingLengthRequired';
import { StaffingPreconditionFailed } from '../components/StaffingPreconditionFailed';
import { StaffingPayloadTooLarge } from '../components/StaffingPayloadTooLarge';
import { StaffingUriTooLong } from '../components/StaffingUriTooLong';
import { StaffingUnsupportedMediaType } from '../components/StaffingUnsupportedMediaType';
import { StaffingRangeNotSatisfiable } from '../components/StaffingRangeNotSatisfiable';
import { StaffingExpectationFailed } from '../components/StaffingExpectationFailed';
import { StaffingImATeapot } from '../components/StaffingImATeapot';
import { StaffingMisdirectedRequest } from '../components/StaffingMisdirectedRequest';
import { StaffingUnprocessableEntity } from '../components/StaffingUnprocessableEntity';
import { StaffingLocked } from '../components/StaffingLocked';
import { StaffingFailedDependency } from '../components/StaffingFailedDependency';
import { StaffingTooEarly } from '../components/StaffingTooEarly';
import { StaffingUpgradeRequired } from '../components/StaffingUpgradeRequired';
import { StaffingPreconditionRequired } from '../components/StaffingPreconditionRequired';
import { StaffingTooManyRequests } from '../components/StaffingTooManyRequests';
import { StaffingRequestHeaderFieldsTooLarge } from '../components/StaffingRequestHeaderFieldsTooLarge';
import { StaffingUnavailableForLegalReasons } from '../components/StaffingUnavailableForLegalReasons';
import { StaffingClientClosedRequest } from '../components/StaffingClientClosedRequest';
import { StaffingRetryWith } from '../components/StaffingRetryWith';
import { StaffingBlockedByWindowsParentalControls } from '../components/StaffingBlockedByWindowsParentalControls';
import { StaffingThisIsFine } from '../components/StaffingThisIsFine';
import { StaffingNetworkAuthenticationRequired } from '../components/StaffingNetworkAuthenticationRequired';
import { StaffingVariantAlsoNegotiates } from '../components/StaffingVariantAlsoNegotiates';
import { StaffingInsufficientStorage } from '../components/StaffingInsufficientStorage';
import { StaffingLoopDetected } from '../components/StaffingLoopDetected';
import { StaffingNotExtended } from '../components/StaffingNotExtended';
import { StaffingNetworkConnectTimeoutError } from '../components/StaffingNetworkConnectTimeoutError';
import { StaffingNetworkReadTimeoutError } from '../components/StaffingNetworkReadTimeoutError';
import { StaffingNetworkWriteTimeoutError } from '../components/StaffingNetworkWriteTimeoutError';
import { StaffingNetworkHostDown } from '../components/StaffingNetworkHostDown';
import { StaffingNetworkHostUnreachable } from '../components/StaffingNetworkHostUnreachable';
import { StaffingNetworkConnectionRefused } from '../components/StaffingNetworkConnectionRefused';
import { StaffingNetworkConnectionReset } from '../components/StaffingNetworkConnectionReset';
import { StaffingNetworkConnectionAborted } from '../components/StaffingNetworkConnectionAborted';
import { StaffingNetworkSocketTimeout } from '../components/StaffingNetworkSocketTimeout';
import { StaffingNetworkSocketError } from '../components/StaffingNetworkSocketError';
import { StaffingNetworkUnknownError } from '../components/StaffingNetworkUnknownError';
import { StaffingNetworkNoResponse } from '../components/StaffingNetworkNoResponse';
import { StaffingNetworkBadResponse } from '../components/StaffingNetworkBadResponse';
import { StaffingNetworkInvalidResponse } from '../components/StaffingNetworkInvalidResponse';
import { StaffingNetworkTooManyRedirects } from '../components/StaffingNetworkTooManyRedirects';
import { StaffingNetworkTooManyRequests } from '../components/StaffingNetworkTooManyRequests';
import { StaffingNetworkRequestCancelled } from '../components/StaffingNetworkRequestCancelled';
import { StaffingNetworkRequestAborted } from '../components/StaffingNetworkRequestAborted';
import { StaffingNetworkRequestFailed } from '../components/StaffingNetworkRequestFailed';
import { StaffingNetworkRequestTimedOut } from '../components/StaffingNetworkRequestTimedOut';
import { StaffingNetworkRequestError } from '../components/StaffingNetworkRequestError';
import { StaffingNetworkRequestUnknownError } from '../components/StaffingNetworkRequestUnknownError';
import { StaffingNetworkRequestNoResponse } from '../components/StaffingNetworkRequestNoResponse';
import { StaffingNetworkRequestBadResponse } from '../components/StaffingNetworkRequestBadResponse';
import { StaffingNetworkRequestInvalidResponse } from '../components/StaffingNetworkRequestInvalidResponse';
import { StaffingNetworkRequestTooManyRedirects } from '../components/StaffingNetworkRequestTooManyRedirects';
import { StaffingNetworkRequestTooManyRequests } from '../components/StaffingNetworkRequestTooManyRequests';
import { StaffingNetworkRequestCancelledByUser } from '../components/StaffingNetworkRequestCancelledByUser';
import { StaffingNetworkRequestAbortedByUser } from '../components/StaffingNetworkRequestAbortedByUser';
import { StaffingNetworkRequestFailedByUser } from '../components/StaffingNetworkRequestFailedByUser';
import { StaffingNetworkRequestTimedOutByUser } from '../components/StaffingNetworkRequestTimedOutByUser';
import { StaffingNetworkRequestErrorByUser } from '../components/StaffingNetworkRequestErrorByUser';
import { StaffingNetworkRequestUnknownErrorByUser } from '../components/StaffingNetworkRequestUnknownErrorByUser';
import { StaffingNetworkRequestNoResponseByUser } from '../components/StaffingNetworkRequestNoResponseByUser';
import { StaffingNetworkRequestBadResponseByUser } from '../components/StaffingNetworkRequestBadResponseByUser';
import { StaffingNetworkRequestInvalidResponseByUser } from '../components/StaffingNetworkRequestInvalidResponseByUser';
import { StaffingNetworkRequestTooManyRedirectsByUser } from '../components/StaffingNetworkRequestTooManyRedirectsByUser';
import { StaffingNetworkRequestTooManyRequestsByUser } from '../components/StaffingNetworkRequestTooManyRequestsByUser';
import { StaffingNetworkRequestCancelledBySystem } from '../components/StaffingNetworkRequestCancelledBySystem';
import { StaffingNetworkRequestAbortedBySystem } from '../components/StaffingNetworkRequestAbortedBySystem';
import { StaffingNetworkRequestFailedBySystem } from '../components/StaffingNetworkRequestFailedBySystem';
import { StaffingNetworkRequestTimedOutBySystem } from '../components/StaffingNetworkRequestTimedOutBySystem';
import { StaffingNetworkRequestErrorBySystem } from '../components/StaffingNetworkRequestErrorBySystem';
import { StaffingNetworkRequestUnknownErrorBySystem } from '../components/StaffingNetworkRequestUnknownErrorBySystem';
import { StaffingNetworkRequestNoResponseBySystem } from '../components/StaffingNetworkRequestNoResponseBySystem';
import { StaffingNetworkRequestBadResponseBySystem } from '../components/StaffingNetworkRequestBadResponseBySystem';
import { StaffingNetworkRequestInvalidResponseBySystem } from '../components/StaffingNetworkRequestInvalidResponseBySystem';
import { StaffingNetworkRequestTooManyRedirectsBySystem } from '../components/StaffingNetworkRequestTooManyRedirectsBySystem';
import { StaffingNetworkRequestTooManyRequestsBySystem } from '../components/StaffingNetworkRequestTooManyRequestsBySystem';
import { StaffingNetworkRequestCancelledByServer } from '../components/StaffingNetworkRequestCancelledByServer';
import { StaffingNetworkRequestAbortedByServer } from '../components/StaffingNetworkRequestAbortedByServer';
import { StaffingNetworkRequestFailedByServer } from '../components/StaffingNetworkRequestFailedByServer';
import { StaffingNetworkRequestTimedOutByServer } from '../components/StaffingNetworkRequestTimedOutByServer';
import { StaffingNetworkRequestErrorByServer } from '../components/StaffingNetworkRequestErrorByServer';
import { StaffingNetworkRequestUnknownErrorByServer } from '../components/StaffingNetworkRequestUnknownErrorByServer';
import { StaffingNetworkRequestNoResponseByServer } from '../components/StaffingNetworkRequestNoResponseByServer';
import { StaffingNetworkRequestBadResponseByServer } from '../components/StaffingNetworkRequestBadResponseByServer';
import { StaffingNetworkRequestInvalidResponseByServer } from '../components/StaffingNetworkRequestInvalidResponseByServer';


const Staffing: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [staffingData, setStaffingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffingData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('staffing').select('*');
      if (error) throw error;
      setStaffingData(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffingData();
  }, [fetchStaffingData]);

  const isStaffing = location.pathname.includes('/staffing');

  return (
    <div className="p-4">
      <StaffingHeader />
      {loading && <StaffingLoading />}
      {error && <StaffingError message={error} />}
      {!loading && !error && staffingData.length === 0 && <StaffingEmpty />}
      {!loading && !error && staffingData.length > 0 && (
        <StaffingTable data={staffingData} />
      )}
    </div>
  );
};

export { Staffing };
