"""init

Revision ID: 1a08223e7bba
Revises: 4822b372f17f
Create Date: 2024-12-09 09:12:31.096663

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a08223e7bba'
down_revision = '4822b372f17f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_cosoyte_captren_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_quanhuyen_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_quocgia_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_tinhthanh_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_tuyendonvi_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_userinfo_id', table_name='cosoyte')
    op.drop_index('ix_cosoyte_xaphuong_id', table_name='cosoyte')
    op.drop_table('cosoyte')
    op.drop_constraint('appinfo_cosoyte_id_fkey', 'appinfo', type_='foreignkey')
    op.drop_column('appinfo', 'cosoyte_id')
    op.drop_constraint('donvi_appinfo_id_fkey', 'donvi', type_='foreignkey')
    op.create_foreign_key(None, 'donvi', 'appinfo', ['appinfo_id'], ['id'])
    op.drop_index('ix_profile_user_cosoyte_id', table_name='profile_user')
    op.drop_constraint('profile_user_cosoyte_id_fkey', 'profile_user', type_='foreignkey')
    op.drop_column('profile_user', 'cosoyte_id')
    op.drop_constraint('userinfo_cosoyte_id_fkey', 'userinfo', type_='foreignkey')
    op.drop_column('userinfo', 'cosoyte_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('userinfo', sa.Column('cosoyte_id', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.create_foreign_key('userinfo_cosoyte_id_fkey', 'userinfo', 'cosoyte', ['cosoyte_id'], ['id'])
    op.add_column('profile_user', sa.Column('cosoyte_id', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.create_foreign_key('profile_user_cosoyte_id_fkey', 'profile_user', 'cosoyte', ['cosoyte_id'], ['id'])
    op.create_index('ix_profile_user_cosoyte_id', 'profile_user', ['cosoyte_id'], unique=False)
    op.drop_constraint(None, 'donvi', type_='foreignkey')
    op.create_foreign_key('donvi_appinfo_id_fkey', 'donvi', 'userinfo', ['appinfo_id'], ['id'])
    op.add_column('appinfo', sa.Column('cosoyte_id', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.create_foreign_key('appinfo_cosoyte_id_fkey', 'appinfo', 'cosoyte', ['cosoyte_id'], ['id'])
    op.create_table('cosoyte',
    sa.Column('created_at', sa.BIGINT(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('updated_at', sa.BIGINT(), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('deleted', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('deleted_by', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('deleted_at', sa.BIGINT(), autoincrement=False, nullable=True),
    sa.Column('id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('ma_donvi', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('ten_donvi', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('tenkhongdau', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('level_donvi', sa.SMALLINT(), autoincrement=False, nullable=False),
    sa.Column('hinhthuchintochuc', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('xaphuong_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('xaphuong', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('quanhuyen_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('quanhuyen', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('tinhthanh_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('tinhthanh', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('quocgia_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('quocgia', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('sonha_tenduong', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('diachi', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('tuyendonvi_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('email_donvi', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('dienthoai_donvi', sa.VARCHAR(length=63), autoincrement=False, nullable=True),
    sa.Column('active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('captren_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('userinfo_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['captren_id'], ['cosoyte.id'], name='cosoyte_captren_id_fkey'),
    sa.ForeignKeyConstraint(['quanhuyen_id'], ['quanhuyen.id'], name='cosoyte_quanhuyen_id_fkey'),
    sa.ForeignKeyConstraint(['quocgia_id'], ['quocgia.id'], name='cosoyte_quocgia_id_fkey'),
    sa.ForeignKeyConstraint(['tinhthanh_id'], ['tinhthanh.id'], name='cosoyte_tinhthanh_id_fkey'),
    sa.ForeignKeyConstraint(['tuyendonvi_id'], ['tuyendonvi.id'], name='cosoyte_tuyendonvi_id_fkey'),
    sa.ForeignKeyConstraint(['userinfo_id'], ['userinfo.id'], name='cosoyte_userinfo_id_fkey'),
    sa.ForeignKeyConstraint(['xaphuong_id'], ['xaphuong.id'], name='cosoyte_xaphuong_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='cosoyte_pkey')
    )
    op.create_index('ix_cosoyte_xaphuong_id', 'cosoyte', ['xaphuong_id'], unique=False)
    op.create_index('ix_cosoyte_userinfo_id', 'cosoyte', ['userinfo_id'], unique=False)
    op.create_index('ix_cosoyte_tuyendonvi_id', 'cosoyte', ['tuyendonvi_id'], unique=False)
    op.create_index('ix_cosoyte_tinhthanh_id', 'cosoyte', ['tinhthanh_id'], unique=False)
    op.create_index('ix_cosoyte_quocgia_id', 'cosoyte', ['quocgia_id'], unique=False)
    op.create_index('ix_cosoyte_quanhuyen_id', 'cosoyte', ['quanhuyen_id'], unique=False)
    op.create_index('ix_cosoyte_captren_id', 'cosoyte', ['captren_id'], unique=False)
    # ### end Alembic commands ###
