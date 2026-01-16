import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
`;

const Title = styled.h1`
  color: #ffffff;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #dc2626;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #dc2626;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
  }

  &.success {
    background: #10b981;
    color: white;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LedgerContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  margin-bottom: 2rem;
`;

const LedgerHeader = styled.div`
  background: #dc2626;
  color: white;
  padding: 1rem 1.5rem;
  font-weight: bold;
  font-size: 1.1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;

  th {
    background: #f3f4f6;
    color: #374151;
    padding: 10px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #e5e7eb;
  }

  td {
    padding: 8px 10px;
    text-align: center;
    border: 1px solid #e5e7eb;
    font-size: 10pt;
  }

  tbody tr:nth-child(even) {
    background: #f9fafb;
  }

  tbody tr:hover {
    background: #fee2e2;
  }

  .inward {
    color: #10b981;
    font-weight: bold;
  }

  .outward {
    color: #ef4444;
    font-weight: bold;
  }

  .total-row {
    background: #1f2937 !important;
    color: white;
    font-weight: bold;
  }

  .production { background: #d1fae5; }
  .purchase { background: #dbeafe; }
  .sale { background: #fee2e2; }
  .palti { background: #fef3c7; }
`;

const SummarySection = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-top: 2px solid #e5e7eb;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  text-align: center;

  .label {
    font-weight: 600;
    color: #6b7280;
    font-size: 0.85rem;
  }

  .value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #374151;
    margin-top: 0.5rem;
  }

  &.production {
    border-color: #10b981;
    .value { color: #10b981; }
  }

  &.purchase {
    border-color: #3b82f6;
    .value { color: #3b82f6; }
  }

  &.sale {
    border-color: #ef4444;
    .value { color: #ef4444; }
  }

  &.balance {
    border-color: #8b5cf6;
    .value { color: #8b5cf6; }
  }

  &.palti {
    border-color: #f59e0b;
    .value { color: #f59e0b; }
  }
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

interface Location {
    id: number;
    code: string;
    name?: string;
}

interface LedgerEntry {
    id: number | string;
    date: string;
    movementType: string;
    productType: string;
    variety?: string;
    bags: number;
    quantityQuintals: number;
    packagingBrand: string;
    locationCode: string;
    billNumber?: string;
    lorryNumber?: string;
    status: string;
    isInward?: boolean;
    isOutward?: boolean;
    runningBalance?: number;
    runningBalanceQtls?: number;
}

interface LedgerData {
    location: Location;
    openingBalance: { bags: number; quintals: number };
    entries: LedgerEntry[];
    totals: {
        production: { bags: number; quintals: number };
        purchase: { bags: number; quintals: number };
        sale: { bags: number; quintals: number };
        palti: { bags: number; quintals: number };
        balance: { bags: number; quintals: number };
    };
}

const RiceLedger: React.FC = () => {
    const { user } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [productType, setProductType] = useState('');
    const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit] = useState(50);

    const productTypes = [
        'Rice', 'Bran', 'Broken', 'RJ Rice 1', 'RJ Rice 2', 'RJ Broken',
        '0 Broken', 'Sizer Broken', 'Unpolish', 'Faram'
    ];

    useEffect(() => {
        fetchLocations();
    }, []);

    // Refetch when page changes (only if location is already selected)
    useEffect(() => {
        if (selectedLocation && ledgerData) {
            fetchLedger();
        }
    }, [page]);

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/locations/rice-stock-locations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocations((response.data as any).locations || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('Failed to fetch locations');
        }
    };

    const fetchLedger = async () => {
        if (!selectedLocation) {
            toast.error('Please select a location');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params: any = { locationCode: selectedLocation, page, limit };
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            if (productType) params.productType = productType;

            const response = await axios.get('/rice-stock-management/ledger', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            const responseData = (response.data as any).data;
            setLedgerData(responseData);

            // Update pagination state from response
            if (responseData?.pagination) {
                setTotalPages(responseData.pagination.totalPages || 1);
                setTotalRecords(responseData.pagination.totalRecords || 0);
            }

            toast.success('Ledger loaded successfully');
        } catch (error: any) {
            console.error('Error fetching ledger:', error);
            // If endpoint doesn't exist, show sample data
            if (error.response?.status === 404) {
                // Create sample from movements
                fetchMovementsAsLedger();
            } else {
                toast.error('Failed to fetch ledger');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMovementsAsLedger = async () => {
        try {
            const token = localStorage.getItem('token');
            const params: any = {};
            if (dateFrom) params.startDate = dateFrom;
            if (dateTo) params.endDate = dateTo;
            if (productType) params.productType = productType;

            const response = await axios.get('/rice-stock-management/movements', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            const movements = (response.data as any).data?.movements || [];

            // Filter by location
            const filteredMovements = movements.filter((m: any) =>
                m.location_code === selectedLocation || m.locationCode === selectedLocation
            );

            // Calculate totals
            const totals = {
                production: { bags: 0, quintals: 0 },
                purchase: { bags: 0, quintals: 0 },
                sale: { bags: 0, quintals: 0 },
                palti: { bags: 0, quintals: 0 },
                balance: { bags: 0, quintals: 0 }
            };

            let runningBalance = 0;
            const entries = filteredMovements.map((m: any) => {
                // High-resilience extraction
                const mvtType = (m.movementType || m.movement_type || m.movementtype || m.MovementType || 'unknown').toLowerCase();
                const bags = parseInt(m.bags || m.BAGS || m.Bags) || 0;
                const bagsSize = parseFloat(m.bagSizeKg || m.bag_size_kg || m.bagsizekg || 26);

                let qtls = parseFloat(m.quantityQuintals || m.quantity_quintals || m.quantityquintals || m.QuantityQuintals);
                if (isNaN(qtls) || qtls === 0) {
                    qtls = (bags * bagsSize) / 100;
                }

                if (mvtType === 'production' || mvtType === 'purchase') {
                    totals[mvtType as keyof typeof totals].bags += bags;
                    totals[mvtType as keyof typeof totals].quintals += qtls;
                    runningBalance += bags;
                } else if (mvtType === 'sale') {
                    totals.sale.bags += bags;
                    totals.sale.quintals += qtls;
                    runningBalance -= bags;
                } else if (mvtType === 'palti') {
                    // Palti logic for running balance: 
                    // Determine if the selected location is the source or target
                    const fromLoc = m.fromLocation || m.from_location || m.fromlocation || m.locationCode || m.location_code || m.locationcode;
                    const toLoc = m.toLocation || m.to_location || m.tolocation;

                    if (toLoc === selectedLocation) {
                        // We are the target (Inward)
                        runningBalance += bags;
                    } else {
                        // We are the source (Outward)
                        const shortageBags = parseInt(m.conversionShortageBags || m.conversion_shortage_bags || m.conversionshortagebags || 0);
                        runningBalance -= (bags + shortageBags);
                    }

                    totals.palti.bags += bags;
                    totals.palti.quintals += qtls;
                }

                return {
                    id: m.id || m.ID,
                    date: m.date || m.DATE || m.Date,
                    movementType: mvtType,
                    productType: m.productType || m.product_type || m.producttype || 'Rice',
                    variety: m.variety || m.VARIETY || m.Variety || '-',
                    bags: bags,
                    quantityQuintals: qtls,
                    packagingBrand: m.packagingBrand || m.packaging_brand || m.packagingbrand || m.targetPackagingBrand || m.target_packaging_brand || '-',
                    locationCode: m.locationCode || m.location_code || m.locationcode,
                    billNumber: m.billNumber || m.bill_number || m.billnumber || '-',
                    lorryNumber: m.lorryNumber || m.lorry_number || m.lorrynumber || '-',
                    status: m.status || m.STATUS || m.Status,
                    runningBalance: runningBalance
                };
            });

            totals.balance.bags = runningBalance;
            // Note: We'd need to track runningQuintals separately for perfect total quintals,
            // but for now setting it from the last entry's runningBalance if available
            totals.balance.quintals = entries.length > 0 ? (entries[entries.length - 1] as any).runningBalanceQtls || totals.production.quintals + totals.purchase.quintals - totals.sale.quintals : 0;

            setLedgerData({
                location: { id: 0, code: selectedLocation },
                openingBalance: { bags: 0, quintals: 0 },
                entries: entries,
                totals: totals
            });

            toast.success(`Loaded ${entries.length} movements for ${selectedLocation}`);
        } catch (error) {
            console.error('Error fetching movements:', error);
            toast.error('Failed to fetch rice movements');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const getMovementTypeLabel = (type: string, product?: string) => {
        let label = '';
        const lowerType = (type || '').toLowerCase();
        switch (lowerType) {
            case 'production': label = '🏭 Production'; break;
            case 'purchase': label = '📦 Purchase'; break;
            case 'sale': label = '💰 Sale'; break;
            case 'palti': label = '🔄 Palti'; break;
            default: label = type ? `❓ ${type}` : '❓ Unknown';
        }
        if (product && product !== 'Rice' && product !== 'null' && product !== 'undefined' && product !== '-') {
            return `${label} (${product})`;
        }
        return label;
    };

    return (
        <Container>
            <Title>🌾 Rice Stock Ledger</Title>

            <FilterSection>
                <FilterRow>
                    <FormGroup>
                        <Label>Location *</Label>
                        <Select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="">-- Select Location --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.code}>
                                    {loc.code} {loc.name ? `- ${loc.name}` : ''}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>Product Type</Label>
                        <Select
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                        >
                            <option value="">All Products</option>
                            {productTypes.map(pt => (
                                <option key={pt} value={pt}>{pt}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>From Date</Label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>To Date</Label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Button className="primary" onClick={fetchLedger} disabled={loading}>
                            {loading ? '⏳ Loading...' : '📊 View Ledger'}
                        </Button>
                    </FormGroup>
                </FilterRow>
            </FilterSection>

            {ledgerData && (
                <LedgerContainer>
                    <LedgerHeader>
                        📍 Location: {ledgerData.location.code} {ledgerData.location.name ? `- ${ledgerData.location.name}` : ''}
                    </LedgerHeader>

                    <SummarySection>
                        <SummaryGrid>
                            <SummaryCard className="production">
                                <div className="label">Production</div>
                                <div className="value">{ledgerData.totals.production.bags} bags</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {ledgerData.totals.production.quintals.toFixed(2)} Qtls
                                </div>
                            </SummaryCard>
                            <SummaryCard className="purchase">
                                <div className="label">Purchase</div>
                                <div className="value">{ledgerData.totals.purchase.bags} bags</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {ledgerData.totals.purchase.quintals.toFixed(2)} Qtls
                                </div>
                            </SummaryCard>
                            <SummaryCard className="sale">
                                <div className="label">Sales</div>
                                <div className="value">{ledgerData.totals.sale.bags} bags</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {ledgerData.totals.sale.quintals.toFixed(2)} Qtls
                                </div>
                            </SummaryCard>
                            <SummaryCard className="palti">
                                <div className="label">Palti</div>
                                <div className="value">{ledgerData.totals.palti.bags} bags</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {ledgerData.totals.palti.quintals.toFixed(2)} Qtls
                                </div>
                            </SummaryCard>
                            <SummaryCard className="balance">
                                <div className="label">Balance</div>
                                <div className="value">{ledgerData.totals.balance.bags} bags</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {ledgerData.totals.balance.quintals.toFixed(2)} Qtls
                                </div>
                            </SummaryCard>
                        </SummaryGrid>
                    </SummarySection>

                    {/* Pagination Controls */}
                    {totalRecords > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: page <= 1 ? '#e5e7eb' : '#dc2626',
                                    color: page <= 1 ? '#9ca3af' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ← Previous
                            </button>
                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                                Page {page} of {totalPages} ({totalRecords.toLocaleString()} records)
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: page >= totalPages ? '#e5e7eb' : '#dc2626',
                                    color: page >= totalPages ? '#9ca3af' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    )}

                    {ledgerData.entries.length === 0 ? (
                        <EmptyState>
                            <p>No movements found for this location</p>
                        </EmptyState>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Variety</th>
                                    <th>Packaging</th>
                                    <th>Bags</th>
                                    <th>Quintals</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Opening Balance Row */}
                                {ledgerData.openingBalance && (ledgerData.openingBalance.bags !== 0 || ledgerData.openingBalance.quintals !== 0) && (
                                    <tr style={{ background: '#f8fafc', fontStyle: 'italic' }}>
                                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Opening Balance</td>
                                        <td>{ledgerData.openingBalance.bags}</td>
                                        <td>{ledgerData.openingBalance.quintals.toFixed(2)}</td>
                                        <td style={{ fontWeight: 'bold' }}>{ledgerData.openingBalance.bags}</td>
                                    </tr>
                                )}

                                {ledgerData.entries.map((entry, idx) => (
                                    <tr key={entry.id || idx} className={entry.movementType || (entry as any).movement_type}>
                                        <td>{formatDate(entry.date)}</td>
                                        <td>{getMovementTypeLabel(entry.movementType || (entry as any).movement_type, entry.productType || (entry as any).product_type)}</td>
                                        <td>{entry.variety || '-'}</td>
                                        <td>{entry.packagingBrand || (entry as any).packaging_brand || '-'}</td>
                                        <td className={entry.isOutward ? 'outward' : 'inward'}>
                                            {entry.isOutward ? '-' : '+'}{entry.bags}
                                        </td>
                                        <td className={entry.isOutward ? 'outward' : 'inward'}>
                                            {entry.isOutward ? '-' : '+'}{entry.quantityQuintals?.toFixed(2) || '0.00'}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{entry.runningBalance || 0}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={4}>TOTAL BALANCE</td>
                                    <td>{ledgerData.totals.balance.bags}</td>
                                    <td>{ledgerData.totals.balance.quintals.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </Table>
                    )}
                </LedgerContainer>
            )}

            {!ledgerData && !loading && (
                <EmptyState>
                    <h3>Select a location to view Rice Stock Ledger</h3>
                    <p>The ledger shows all rice movements (production, purchase, sale, palti) for the selected location with running balance.</p>
                </EmptyState>
            )}
        </Container>
    );
};

export default RiceLedger;
